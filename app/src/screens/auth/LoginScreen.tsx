import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
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
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as LocationState | null)?.from?.pathname ?? "/start";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
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

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  fullWidth
                />
                <TextField
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  type="password"
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  fullWidth
                  startIcon={
                    submitting ? <CircularProgress size={18} /> : undefined
                  }
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Tip: you can later wire this to your backend “services” login API.
            </Typography>
          </Stack>
        </Card>
    </FullPageContainer>
  );
};

export default LoginScreen;