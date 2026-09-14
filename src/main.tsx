import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import App from "./App";
import './index.css'

// Register all AG Charts community modules at startup (v13+)
// AllCommunityModule is an array of ModuleDefinition that includes all series, axes, and features
ModuleRegistry.registerModules(AllCommunityModule)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)