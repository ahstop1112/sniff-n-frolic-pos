import React, { useState, useMemo } from "react"
import {
  Alert, Box, Button, CircularProgress,
  Paper, Stack, TextField, Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import { FullPageContainer } from "@/screens/layout/PageContainer";
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
    <FullPageContainer>
      <Paper className={styles.card} elevation={6}>
      <Stack spacing={2}>

        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={800}>POS Login</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to access Manage / Sales.
          </Typography>
        </Box>

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Step 1 — email */}
        {step === "email" ? (
          <Box component="form" onSubmit={onRequestCode}>
            <Stack spacing={1.5}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                fullWidth
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
              >
                {isLoading ? "Sending code…" : "Send verification code"}
              </Button>
            </Stack>
          </Box>

        ) : (
        /* Step 2 — OTP */
          <Box component="form" onSubmit={onVerifyCode}>
            <Stack spacing={1.5}>
              <TextField label="Email" value={email} fullWidth disabled />

              <TextField
                label="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="one-time-code"
                fullWidth
                disabled={isLoading}
                inputProps={{ maxLength: 6 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
              >
                {isLoading ? "Verifying…" : "Verify and sign in"}
              </Button>

              <Button type="button" variant="text" fullWidth
                onClick={onResendCode} disabled={isLoading}>
                Resend code
              </Button>

              <Button type="button" variant="text" fullWidth
                onClick={onBackToEmail} disabled={isLoading}>
                Use another email
              </Button>
            </Stack>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          We'll send a one-time login code to your email.
        </Typography>

      </Stack>
      </Paper>
    </FullPageContainer>
  )
}

export default LoginScreen;