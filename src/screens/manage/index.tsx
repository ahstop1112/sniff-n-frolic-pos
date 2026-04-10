import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuthStore } from "@/domains/auth/store";

const ManageScreen = () => {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <Box p={2}>
      <Stack spacing={2}>
        <Typography variant="h5">Manage</Typography>
        <Typography>
          User: <b>{user?.name}</b>
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => nav("/sales")}>
            Go Sales
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ManageScreen;