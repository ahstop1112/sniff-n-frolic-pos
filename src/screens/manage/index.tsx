import { Outlet, useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuthStore } from "@/domains/auth/store";
import Header from "../layout/Header";

const ManageScreen = () => {
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <div>
      <Header />
      <Stack spacing={2}>
        <Typography variant="h2">Manage</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => nav("/pos/manage/products")}>
            Products
          </Button>
          <Button variant="contained" onClick={() => nav("/pos/manage/inventory")}>
            Inventory
          </Button>
        </Stack>
        <Box p={2}>
          <Outlet />
        </Box>
      </Stack>
    </div>
  );
};

export default ManageScreen;