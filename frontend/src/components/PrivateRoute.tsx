import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { LoadingOverlay } from '@mantine/core'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children?: React.ReactNode
  redirectToLogin?: string
  redirectToUnauthorized?: string
}

const PrivateRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  redirectToLogin = '/login',
  redirectToUnauthorized = '/unauthorized',
}) => {
  const { user, isLoading, error, isInitialized } = useSelector((state: RootState) => state.auth)

  if (!isInitialized || isLoading) {
    return <LoadingOverlay visible />
  }

  if (error || !user) {
    return <Navigate to={redirectToLogin} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectToUnauthorized} replace />
  }

  return <>{children}</>
}

export default PrivateRoute;
