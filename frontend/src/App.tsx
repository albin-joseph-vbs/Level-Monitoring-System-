import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

// As you build more pages, import them here:
// import Vessels from './pages/Vessels'
// import Alerts  from './pages/Alerts'
// import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard — loads at http://localhost:5173 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Add new pages below as you build them */}
        {/* <Route path="/vessels"  element={<Vessels />}  /> */}
        {/* <Route path="/alerts"   element={<Alerts />}   /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}

        {/* Catch-all — redirect unknown URLs to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}