import { styled } from "@mui/material/styles";
import { AppBar, Box, Container, ToggleButtonGroup } from "@mui/material";

export const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
}));

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: "sticky",
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ToolbarContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  width: "100%",
}));

export const Left = styled("div")({
  minWidth: 200,
  display: "flex",
  alignItems: "center",
  gap: 6,
});

export const Center = styled("div")({
  flex: 1,
  display: "flex",
  justifyContent: "center",
});

export const Right = styled("div")({
  minWidth: 200,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
});

export const ModeSwitch = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButton-root": {
    padding: theme.spacing(1, 2.5),
    textTransform: "none",
    borderRadius: theme.shape.borderRadius,
  },
}));

export const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

export const PageContainer = styled(Container)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));
