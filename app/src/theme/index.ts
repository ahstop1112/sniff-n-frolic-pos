import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#111827",   // 深灰黑（專業）
        },
        secondary: {
            main: "#6b7280",   // 中灰
        },
        success: {
            main: "#16a34a",
        },
        warning: {
            main: "#f59e0b",
        },
        error: {
            main: "#ef4444",
        },
        background: {
            default: "#f9fafb", // 整體背景
            paper: "#ffffff",   // 卡片 / header
        },
        divider: "#e5e7eb",
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    typography: {
        htmlFontSize: 16,
        fontSize: 16,
        fontFamily: [
            "Inter",
            "system-ui",
            "-apple-system",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "Apple Color Emoji",
            "Segoe UI Emoji",
        ].join(","),
        body1: {
            fontSize: "1rem", // 16px
        },
        body2: {
            fontSize: "0.875rem", // 14px（次級）
        },
        button: { fontSize: "1rem", textTransform: "none", fontWeight: 700 },
        subtitle1: { fontSize: "1rem", fontWeight: 700 },
        h6: { fontSize: "1.125rem", fontWeight: 800 },
        h5: { fontSize: "1.25rem", fontWeight: 800 },
        h4: { fontSize: "1.5rem", fontWeight: 800 },
        h3: { fontSize: "1.875rem", fontWeight: 800 },
        h2: { fontSize: "2.25rem", fontWeight: 800 },
        h1: { fontSize: "3rem", fontWeight: 800 },
    
    },
    components: {
      MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        // touch friendly
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        size: "large",
        variant: "contained",
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 44,              // touch friendly
          borderRadius: theme.shape.borderRadius,
          fontWeight: 800,
        }),
      },
        },
    // Icon Buttons
    MuiIconButton: {
      defaultProps: {
        size: "large",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          width: 44,
          height: 44,
          borderRadius: theme.shape.borderRadius,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
        },
    // Toggle Buttons
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 44,
          paddingInline: theme.spacing(2),
          borderColor: theme.palette.divider,
          fontWeight: 800,
          textTransform: "none",
          "&.Mui-selected": {
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.common.white,
            "&:hover": {
              backgroundColor: theme.palette.grey[900],
            },
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          overflow: "hidden",
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
  },
});