import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "@/context/auth/useAuth";

const TerminalShell = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Typography variant="h5">Terminal</Typography>
        <Typography>
          Cashier: <b>{user?.name}</b>
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => nav("/console")}>
            Go Console
          </Button>
          <Button color="error" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TerminalShell;
