import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Alert, Button, CircularProgress,
  TextField, Typography,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import BrandShell from "@/screens/layout/BrandShell";
import OtpCodeInput from "./OtpCodeInput";
import styles from "./LoginScreen.module.scss";

// OTP TTL is 5 minutes server-side (see services/.env OTP_TTL_MINUTES).
// The countdown is a visual approximation — the server enforces expiry.
const OTP_TTL_SECONDS = 5 * 60

const formatCountdown = (secs: number) => {
  const s = Math.max(0, Math.floor(secs))
  const mm = Math.floor(s / 60)
  const ss = (s % 60).toString().padStart(2, "0")
  return `${mm}:${ss}`
}

type LocationState = {
  from?: { pathname?: string }
}

const LoginScreen = () => {
  const requestCode = useAuthStore((s) => s.requestCode)
  const verifyCode  = useAuthStore((s) => s.verifyCode)
  const isLoading   = useAuthStore((s) => s.isLoading)
  const storeError  = useAuthStore((s) => s.error)

  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/pos/start"

  const [email, setEmail]           = useState("")
  const [code, setCode]             = useState("")
  const [step, setStep]             = useState<"email" | "code">("email")
  const [localError, setLocalError] = useState<string | null>(null)

  // Countdown timer for the OTP step. The start time is refreshed when the
  // user first arrives on this step and again after each Resend.
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (step !== "code") return
    tickRef.current = setInterval(() => setNow(Date.now()), 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [step])

  const secondsRemaining = codeSentAt
    ? Math.max(0, OTP_TTL_SECONDS - Math.floor((now - codeSentAt) / 1000))
    : OTP_TTL_SECONDS

  const error = localError ?? storeError

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  )

  const onRequestCode: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim())   return setLocalError("Email is required.")
    if (!isEmailValid)   return setLocalError("Please enter a valid email address.")

    try {
      await requestCode(email.trim())
      setCodeSentAt(Date.now())
      setStep("code")
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send verification code.")
    }
  }

  const onVerifyCode: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!code.trim()) return setLocalError("Verification code is required.")

    try {
      await verifyCode({ email: email.trim(), code: code.trim() })
      navigate(from, { replace: true })
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed.")
    }
  }

  const onBackToEmail = () => {
    setCode("")
    setLocalError(null)
    setStep("email")
  }

  const onResendCode = async () => {
    setLocalError(null)
    try {
      await requestCode(email.trim())
      setCodeSentAt(Date.now())
      setCode("")
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to resend verification code.")
    }
  }

  return (
    <BrandShell>
      <div className={styles.card}>
          <div className={styles.cardChip}>
            <PetsIcon fontSize="small" />
          </div>

          {step === "email" && (
            <div className={styles.cardHead}>
              <Typography variant="h3" component="h2">POS Login</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access Manage / Sales.
              </Typography>
            </div>
          )}

          {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}

          {step === "email" ? (
            <form onSubmit={onRequestCode}>
              <div className={styles.formStack}>
                <Typography variant="overline">Email</Typography>
                <TextField
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  fullWidth
                  disabled={isLoading}
                  placeholder="you@sniffandfrolic.ca"
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
                  className={styles.primaryButton}
                >
                  {isLoading ? "Sending code…" : "Send verification code"}
                </Button>
                <p className={styles.emailHint}>
                  We&apos;ll send a one-time login code to your email.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={onVerifyCode}>
              <div className={`${styles.cardHead} ${styles.tight}`}>
                <Typography variant="h3" component="h2">Enter your code</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent to <b>{email}</b> · expires in <b>{formatCountdown(secondsRemaining)}</b>.
                </Typography>
              </div>

              <OtpCodeInput
                value={code}
                onChange={setCode}
                onComplete={() => {
                  // Auto-submit when all six digits land.
                  const form = document.activeElement?.closest("form")
                  form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
                }}
                disabled={isLoading}
                autoFocus
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading || code.length < 6}
                startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
                className={styles["primaryButton--otp"]}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>

              <div className={styles.otpFooter}>
                <Typography variant="body2" color="text.secondary" className={styles.otpFooterLabel}>
                  Didn&apos;t get it?
                </Typography>
                <div className={styles.otpFooterActions}>
                  <Button type="button" variant="outlined" size="small"
                    onClick={onResendCode} disabled={isLoading}>
                    Resend code
                  </Button>
                  <Button type="button" variant="outlined" size="small"
                    onClick={onBackToEmail} disabled={isLoading}
                    startIcon={<ChevronLeftIcon className={styles.chevronNudge} />}>
                    Change email
                  </Button>
                </div>
              </div>
            </form>
          )}

          <hr className={styles.divider} />

          <div className={styles.cardFooter}>
            <Typography variant="body2" color="text.secondary">
              Shared terminal?
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonOutlineIcon />}
              disabled
            >
              Use staff PIN
            </Button>
          </div>
        </div>
    </BrandShell>
  )
}

export default LoginScreen;
