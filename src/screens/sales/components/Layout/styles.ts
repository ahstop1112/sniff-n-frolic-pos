import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

export const Root = styled(Box)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  background: theme.palette.background.default,
}));

export const HeaderArea = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
  background: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  display: "grid",
  gap: theme.spacing(2),
  padding: theme.spacing(2),

  // default: single column
  gridTemplateColumns: "1fr",

  // md+: 2 columns (Product / Cart)
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1fr) 380px",
  },

  // lg+: slightly wider cart
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "minmax(0, 1fr) 420px",
  },
}));

export const Panel = styled(Box)(({ theme }) => ({
  minHeight: 0,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

export const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

export const PanelBody = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  padding: theme.spacing(2),
}));

export const MobileSwitchBar = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));
