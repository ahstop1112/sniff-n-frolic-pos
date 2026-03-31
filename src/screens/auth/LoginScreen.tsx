import React, { useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store";
import { FullPageContainer } from "@/screens/layout/PageContainer/styles";
import { Card } from "./styles";

type LocationState = {
  from?: { pathname?: string };
};

const LoginScreen = () => {
  const requestCode = useAuthStore((s) => s.requestCode);
  const verifyCode = useAuthStore((s) => s.verifyCode);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeError = useAuthStore((s) => s.error);

  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as LocationState | null)?.from?.pathname ?? "/start";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? storeError;

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const onRequestCode: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Email is required.');
      return;
    }

    if (!isEmailValid) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    try {
      await requestCode(email.trim());
      setStep('code');
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to send verification code.',
      );
    }
  };

  const onVerifyCode: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!code.trim()) {
      setLocalError('Verification code is required.');
      return;
    }

    try {
      await verifyCode({
        email: email.trim(),
        code: code.trim(),
      });

      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  const onBackToEmail = () => {
    setCode('');
    setLocalError(null);
    setStep('email');
  };

  const onResendCode = async () => {
    setLocalError(null);

    try {
      await requestCode(email.trim());
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to resend verification code.',
      );
    }
  };

  return (
    <FullPageContainer>
      <Card elevation={6}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              POS Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access Manage / Sales.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {step === 'email' ? (
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
                  disabled={isLoading}
                  fullWidth
                  startIcon={
                    isLoading ? <CircularProgress size={18} /> : undefined
                  }
                >
                  {isLoading ? 'Sending code…' : 'Send verification code'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={onVerifyCode}>
              <Stack spacing={1.5}>
                <TextField
                  label="Email"
                  value={email}
                  fullWidth
                  disabled
                />

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
                  disabled={isLoading}
                  fullWidth
                  startIcon={
                    isLoading ? <CircularProgress size={18} /> : undefined
                  }
                >
                  {isLoading ? 'Verifying…' : 'Verify and sign in'}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={onResendCode}
                  disabled={isLoading}
                  fullWidth
                >
                  Resend code
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={onBackToEmail}
                  disabled={isLoading}
                  fullWidth
                >
                  Use another email
                </Button>
              </Stack>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            We’ll send a one-time login code to your email.
          </Typography>
        </Stack>
      </Card>
    </FullPageContainer>
  );
};

export default LoginScreen;