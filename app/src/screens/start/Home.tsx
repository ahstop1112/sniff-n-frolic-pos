import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Toolbar,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  CardActionArea,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PetsIcon from "@mui/icons-material/Pets";
import { useAuthStore } from "@/domains/auth/store";
import {
  TopBar,
  TopBarContainer,
  Main,
  MainContainer,
  LogoutButton,
  ModeCard,
  CardInner,
} from "./styles";
import PageContainer from "@/screens/layout/PageContainer";

const HomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const [branch, setBranch] = useState("vancouver");

  const isModeSelection = location.pathname.includes("/pos") || location.pathname.includes("/pos/");

  const handleModeNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <PageContainer>
      {isModeSelection ? (
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={700} marginBottom={6}>
            Choose your operation mode:
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            <ModeCard>
              <CardActionArea onClick={() => handleModeNavigate("/pos/sales")}>
                <CardInner>
                  <CardContent sx={{ textAlign: "center" }}>
                    <PointOfSaleIcon sx={{ fontSize: 80, marginBottom: 4 }} color="primary" />
                    <Typography variant="h5" gutterBottom fontWeight={700}>
                      Sales
                    </Typography>
                    <Typography variant="body2" color="text.secondary" marginBottom={4}>
                      Front-of-house checkout and daily retail operations.
                    </Typography>
                    <Button variant="contained" fullWidth size="large">
                      Enter Sales Mode
                    </Button>
                  </CardContent>
                </CardInner>
              </CardActionArea>
            </ModeCard>

            <ModeCard>
              <CardActionArea onClick={() => handleModeNavigate("/pos/manage")}>
                <CardInner>
                  <CardContent sx={{ textAlign: "center" }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 80, marginBottom: 4 }} color="secondary" />
                    <Typography variant="h5" gutterBottom fontWeight={700}>
                      Manage
                    </Typography>
                    <Typography variant="body2" color="text.secondary" marginBottom={4}>
                      Back-office operations, inventory, and analytics.
                    </Typography>
                    <Button variant="outlined" fullWidth size="large">
                      Enter Manage Mode
                    </Button>
                  </CardContent>
                </CardInner>
              </CardActionArea>
            </ModeCard>
          </Stack>
        </Box>
      ) : (
        <Outlet />
      )}
    </PageContainer>
  );
};

export default HomeScreen;