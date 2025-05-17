import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './components/layouts/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import UsersDashboard from './pages/admin/UsersDashboard'
import ProductsDashboard from './pages/admin/ProductsDashboard'
import CompaniesDashboard from "./pages/admin/CompaniesDashboard.tsx";
import OrdersDashboard from "./pages/admin/OrdersDashboard";
import WarehousesDashboard from "./pages/admin/WarehousesDashboard.tsx";
import TrackShipment from './pages/admin/TrackShipment.tsx'
import PredictionsDashboard from './pages/admin/PredictionsDashboard.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path='home' element={<AdminHome />} />
          <Route path='users' element={<UsersDashboard />} />
          <Route path='products' element={<ProductsDashboard />} />
          <Route path="companies" element={<CompaniesDashboard />} />
          <Route path="warehouses" element={<WarehousesDashboard />} />
          <Route path='orders' element={<OrdersDashboard />} />
          <Route path='shipments/track' element={<TrackShipment />} />
          <Route path='predictions' element={<PredictionsDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
