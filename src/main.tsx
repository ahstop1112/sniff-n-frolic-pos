import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ModuleRegistry } from 'ag-charts-community'
import { LineSeriesModule, BarSeriesModule, AreaSeriesModule, PieSeriesModule, NumberAxisModule, CategoryAxisModule, LegendModule } from 'ag-charts-community'
import App from "./App";
import './index.css'

// Register AG Charts modules
ModuleRegistry.registerModules([
  LineSeriesModule,
  BarSeriesModule,
  AreaSeriesModule,
  PieSeriesModule,
  NumberAxisModule,
  CategoryAxisModule,
  LegendModule,
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)