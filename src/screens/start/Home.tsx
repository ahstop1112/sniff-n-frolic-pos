import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Box, Stack, Typography, CardActionArea,
  CardContent, Button, Card,
} from "@mui/material"
import LogoutIcon from "@mui/icons-material/Logout"
import PointOfSaleIcon from "@mui/icons-material/PointOfSale"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import { useAuthStore } from "@/domains/auth/store"
import PageContainer from "@/screens/layout/PageContainer"
import styles from "./Start.module.scss"

const HomeScreen = () => {
  const navigate    = useNavigate()
  const location    = useLocation()
  const logout      = useAuthStore((s) => s.logout)

  const isModeSelection =
    location.pathname.includes("/pos/home") ||
    location.pathname === "/pos/home"

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <PageContainer>
      {isModeSelection ? (
        <Box textAlign="center">

          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </Button>
          </Box>

          <Typography variant="h4" fontWeight={700} mb={6}>
            Choose your operation mode:
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {/* Sales */}
            <Card className={styles.modeCard}>
              <CardActionArea onClick={() => navigate("/pos/start")}>
                <div className={styles.cardInner}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <PointOfSaleIcon sx={{ fontSize: 80, mb: 4 }} color="primary" />
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Sales
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={4}>
                      Front-of-house checkout and daily retail operations.
                    </Typography>
                    <Button variant="contained" fullWidth size="large">
                      Enter Sales Mode
                    </Button>
                  </CardContent>
                </div>
              </CardActionArea>
            </Card>

            {/* Manage */}
            <Card className={styles.modeCard}>
              <CardActionArea onClick={() => navigate("/pos/manage")}>
                <div className={styles.cardInner}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 80, mb: 4 }} color="secondary" />
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Manage
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={4}>
                      Back-office operations, inventory, and analytics.
                    </Typography>
                    <Button variant="outlined" fullWidth size="large">
                      Enter Manage Mode
                    </Button>
                  </CardContent>
                </div>
              </CardActionArea>
            </Card>
          </Stack>

        </Box>
      ) : (
        <Outlet />
      )}
    </PageContainer>
  )
}

export default HomeScreen