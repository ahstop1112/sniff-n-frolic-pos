import { styled } from "@mui/material/styles";
import { Container, Box, IconButton, ToggleButtonGroup } from "@mui/material";
import type { NetworkStatus } from "./types";

export const Root = styled(Box)(({ theme }) => ({
    width: `100%`,
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: "sticky",
    top: 0,
    zIndex: 20,
}));

export const Left = styled(Box)(() => ({
    display: "flex",
     justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 12,
}));

export const LogoImg = styled("img")(() => ({
    width: 28,
    height: 28,
    objectFit: "contain",
    borderRadius: 8,
}));

export const LogoFallback = styled(Box)(({ theme }) => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.palette.action.hover,
}));

export const BranchRow = styled(Box)(() => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
}));

export const BranchName = styled("div")(() => ({
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 240,
}));

export const StatusDot = styled("span")<{ status: NetworkStatus }>(({ theme, status }) => {
  const color =
    status === "online"
      ? theme.palette.success.main
      : status === "syncing"
      ? theme.palette.warning.main
      : theme.palette.error.main;

  return {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    backgroundColor: color,
    boxShadow: "0 0 0 2px rgba(0,0,0,0.04)",
    flex: "0 0 auto",
  };
});

export const Right = styled(Box)(() => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
}));

export const ModeSwitch = styled(ToggleButtonGroup)(({ theme }) => ({
    height: 44,
    borderRadius: 12,
    overflow: "hidden",

    "& .MuiToggleButton-root": {
    fontWeight: 900,
    textTransform: "none",
    borderColor: theme.palette.divider,
    paddingInline: theme.spacing(2),
    },

    "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    "&:hover": {
        backgroundColor: theme.palette.grey[900],
    },
    },
}));

export const StaffButton = styled(Box)(({ theme }) => ({
    height: 44,
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingInline: 10,
    cursor: "pointer",
    userSelect: "none",
}));

export const HeaderIconButton = styled(IconButton)(({ theme }) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
}))
