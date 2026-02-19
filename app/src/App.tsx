import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import AppProvider from '@/app/provider';

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;