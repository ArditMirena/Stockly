import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css' 

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Unauthorized from './pages/Unauthorized'
import ServerError from './pages/ServerError'
import NotFound from './pages/NotFound'

import AdminLayout from './components/layouts/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import UsersDashboard from './pages/admin/UsersDashboard'
import RoleRequestsDashboard from './pages/admin/RoleRequestsDashboard'
import ProductsDashboard from './pages/admin/ProductsDashboard'
import CompaniesDashboard from './pages/admin/CompaniesDashboard'
import OrdersDashboard from './pages/admin/OrdersDashboard'
import WarehousesDashboard from './pages/admin/WarehousesDashboard'
import TrackShipment from './pages/admin/TrackShipment'
import PredictionsDashboard from './pages/admin/PredictionsDashboard'
import WarehouseProductsDashboard from './pages/admin/WarehouseProductsDashboard'
import InventoryLogsDashboard from "./pages/admin/InventoryLogsDashboard.tsx";
import ReceiptsDashboard from "./pages/admin/ReceiptsDashboard.tsx";
import PaymentSuccess from './pages/PaymentSuccess';
import ProtectedRoute from './components/PrivateRoute'
import { ROLES } from './utils/Roles'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, logout } from './redux/authSlice';
import { setupResponseInterceptor } from './utils/api';
import { AppDispatch, RootState } from './redux/store';
import { LoadingOverlay } from '@mantine/core';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized, isLoading } = useSelector((state: RootState) => (state.auth as { isInitialized: boolean; isLoading: boolean }));

  useEffect(() => {
    setupResponseInterceptor(() => {
      dispatch(logout());
    });

    if (!isInitialized && !isLoading) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized, isLoading]);

  if (!isInitialized && isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="/not-found" element={<NotFound />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Admin area */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER, ROLES.USER]}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Common to all authenticated users */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="companies" element={<CompaniesDashboard />} />
          <Route path="receipts" element={<ReceiptsDashboard />} />


          {/* SUPERADMIN only routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <UsersDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="role-requests"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <RoleRequestsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="predictions"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <PredictionsDashboard />
              </ProtectedRoute>
            }
          />

          {/* BUYER routes (SUPER_ADMIN has access to everything) */}
          <Route
            path="orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER]}>
                <OrdersDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="shipments/track"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER]}>
                <TrackShipment />
              </ProtectedRoute>
            }
          />

          {/* SUPPLIER routes (SUPER_ADMIN has access to everything) */}
          <Route
            path="products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SUPPLIER]}>
                <ProductsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouses"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SUPPLIER]}>
                <WarehousesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="warehouse/products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SUPPLIER]}>
                <WarehouseProductsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
          path="inventory/logs"
          element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SUPPLIER]}>
                  <InventoryLogsDashboard />
              </ProtectedRoute>
          }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
export default App
