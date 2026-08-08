import React, { useState, useMemo } from "react"
import {
  Alert, Box, Button, CircularProgress,
  Stack, TextField, Typography,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import styles from "./LoginScreen.module.scss";

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
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to resend verification code.")
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Left brand panel ─────────────────────── */}
      <aside className={styles.brandPanel}>
        <div className={styles.brandMark}>
          <div className={styles.brandChip}>
            <PetsIcon fontSize="small" />
          </div>
          <div>
            <div className={styles.brandName}>Sniff &amp; Frolic</div>
            <div className={styles.brandSub}>POS · Yaletown YVR</div>
          </div>
        </div>

        <div className={styles.brandHero}>
          <Typography variant="h1" component="h1">
            Open the drawer,<br />start the day.
          </Typography>
          <p>
            Sales, inventory and the Frolic AI watch — all behind one sign-in.
          </p>
        </div>

        <div className={styles.brandFooter}>
          <span>v3.4.1</span>
          <span className={styles.footerDot}>Terminal LANE-A · registered</span>
          <span className={styles.footerDot}>Need help? 604 ⋯ 2210</span>
        </div>
      </aside>

      {/* ── Right stage with card ────────────────── */}
      <main className={styles.stage}>
        <div className={styles.card}>
          <div className={styles.cardChip}>
            <PetsIcon fontSize="small" />
          </div>

          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h3" component="h2">POS Login</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access Manage / Sales.
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {step === "email" ? (
            <Box component="form" onSubmit={onRequestCode}>
              <Stack spacing={1}>
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
                  sx={{ mt: 1.5 }}
                >
                  {isLoading ? "Sending code…" : "Send verification code"}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  We&apos;ll send a one-time login code to your email.
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={onVerifyCode}>
              <Stack spacing={1}>
                <Typography variant="overline">Email</Typography>
                <TextField value={email} fullWidth disabled />

                <Typography variant="overline" sx={{ mt: 1 }}>Verification code</Typography>
                <TextField
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="one-time-code"
                  fullWidth
                  disabled={isLoading}
                  inputProps={{ maxLength: 6 }}
                  placeholder="6-digit code"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
                  sx={{ mt: 1.5 }}
                >
                  {isLoading ? "Verifying…" : "Verify and sign in"}
                </Button>

                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Button type="button" variant="text" fullWidth
                    onClick={onResendCode} disabled={isLoading}>
                    Resend code
                  </Button>
                  <Button type="button" variant="text" fullWidth
                    onClick={onBackToEmail} disabled={isLoading}>
                    Use another email
                  </Button>
                </Stack>
              </Stack>
            </Box>
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
      </main>
    </div>
  )
}

export default LoginScreen;
