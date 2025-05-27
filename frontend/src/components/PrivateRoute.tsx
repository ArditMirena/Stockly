import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { Loader } from '@mantine/core'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children?: React.ReactNode
  redirectToLogin?: string
  redirectToUnauthorized?: string
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  redirectToLogin = '/login',
  redirectToUnauthorized = '/unauthorized',
}) => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  if (isLoading) return <Loader />

  // not logged in
  if (!user) {
    return <Navigate to={redirectToLogin} replace />
  }

  // logged in but role not permitted
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectToUnauthorized} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
