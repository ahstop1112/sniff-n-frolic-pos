import { createTheme } from "@mui/material/styles";
import { brand, radii, shadows } from "./tokens";

export { brand, radii, shadows } from "./tokens";

export const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: "light",
        primary: {
            main: brand.coral,
            dark: brand.coralDark,
            light: brand.coralSoft,
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: brand.navy,
            dark: brand.navyDark,
            light: brand.navySoft,
            contrastText: "#FFFFFF",
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
            default: brand.cream,
            paper: brand.paper,
        },
        text: {
            primary: brand.ink,
            secondary: brand.inkMuted,
            disabled: brand.inkFaint,
        },
        divider: brand.border,
    },
    shape: { borderRadius: radii.md },
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
        caption: { fontSize: "0.8125rem", color: brand.inkMuted },
        overline: {
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: brand.inkMuted,
            lineHeight: 1.4,
        },
        h6: { fontSize: "1.125rem", fontWeight: 800 },
        h5: { fontSize: "1.25rem", fontWeight: 800 },
        h4: { fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.01em" },
        h3: { fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.015em" },
        h2: { fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 },
        h1: { fontSize: "3.25rem", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.08 },

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
          fontWeight: 700,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.text.secondary,
            backgroundColor: "transparent",
          },
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
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.common.white,
            "&:hover": {
              backgroundColor: theme.palette.secondary.dark,
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
          backgroundImage: "none",
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.sm,
          backgroundColor: theme.palette.background.paper,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: brand.inkFaint,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        }),
        input: {
          padding: "14px 14px",
        },
      },
    },
  },
});

// Shadow tokens are not on the MUI shadows scale — surface them alongside
// the theme so callers can reach for them without a separate import.
declare module "@mui/material/styles" {
  interface Theme {
    brandShadows: typeof shadows
  }
  interface ThemeOptions {
    brandShadows?: typeof shadows
  }
}

theme.brandShadows = shadows
