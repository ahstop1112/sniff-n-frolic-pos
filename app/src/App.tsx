import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/providers/RequireAuth";
import LoginScreen from "@/screens/auth/LoginScreen";
import ConsoleShell from "@/screens/console/ConsoleShell";
import TerminalShell from "@/screens/terminal/TerminalShell";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Protected */}
        <Route
          path="/console/*"
          element={
            <RequireAuth>
              <ConsoleShell />
            </RequireAuth>
          }
        />

        <Route
          path="/terminal/*"
          element={
            <RequireAuth>
              <TerminalShell />
            </RequireAuth>
          }
        />

        {/* Default */}
        <Route path="/" element={<Navigate to="/console" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
