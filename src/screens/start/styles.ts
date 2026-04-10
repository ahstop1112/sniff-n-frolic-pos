import { styled } from "@mui/material/styles";
import { Box, Button, Card, Container, Typography, TextField,  FormControl, Select, AppBar } from "@mui/material";

export const PageContainer = styled(Container)(({ theme }) => ({
  minHeight: "calc(100vh - 64px)", 
  display: "grid",
  placeItems: "center",
  padding: theme.spacing(3),
}));

export const ShiftCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
}));

export const Title = styled(Typography)(() => ({
  fontWeight: 800,
}));

export const Sub = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const Row = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

export const FullRow = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const Actions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

export const PrimaryButton = styled(Button)(() => ({
  flex: 1,
  textTransform: "none",
}));

export const SecondaryButton = styled(Button)(() => ({
  textTransform: "none",
}));

export const Field = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(0.75),
}));

export const FieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

// Branch Select
export const BranchControl = styled(FormControl)(() => ({
  minWidth: 220,
  fullWidth: true
}));

export const BranchSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fullWidth: true
}));

// Shell
export const TopBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const TopBarContainer = styled(Container)(() => ({}));

export const Main = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
}));

export const MainContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const LogoutButton = styled(Button)(() => ({
  textTransform: "none",
}));

export const ModeCard = styled(Card)(({ theme }) => ({
  flex: 1,
  maxWidth: 400,
  borderRadius: theme.shape.borderRadius,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

export const CardInner = styled(Box)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(4),
}));