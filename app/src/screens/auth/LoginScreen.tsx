import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/auth/useAuth";

const LoginScreen = () => {
  const { login } = useAuth();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
          }}
        >
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

                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => {
                    setEmail("demo@pos.local");
                    setPassword("demo");
                  }}
                >
                  Fill demo credentials
                </Button>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Tip: you can later wire this to your backend “services” login API.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen;
