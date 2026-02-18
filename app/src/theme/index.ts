import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
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
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
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
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44, // iPad friendly
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(0,0,0,0.08)",
        },
      },
    },
  },
});