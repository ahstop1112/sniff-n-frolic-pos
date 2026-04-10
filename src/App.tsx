import { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from '@/domains/auth/store';
import AppRoutes from "@/routes";
import AppProvider from '@/app/provider';

const App = () => {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  if (status === 'checking') {
    return <div>Loading...</div>;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;