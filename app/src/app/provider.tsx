import type { PropsWithChildren } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/theme";

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppProvider;