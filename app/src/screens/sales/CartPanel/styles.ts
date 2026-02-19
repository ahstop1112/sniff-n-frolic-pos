import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

export const Root = styled(Box)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
}));

export const TabsRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const LinesArea = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  padding: theme.spacing(1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const LineRow = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.25),
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: theme.spacing(1),
}));

export const LineLeft = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.25),
  minWidth: 0,
}));

export const LineRight = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const SummaryBar = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  padding: theme.spacing(1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const SummaryRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

export const ActionsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));
