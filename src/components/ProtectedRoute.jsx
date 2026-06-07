import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { state } = useApp()
  const location = useLocation()

  if (!state.currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(state.currentUser.role)) {
    let redirectPath = '/admin/dashboard'
    if (state.currentUser.role === 'editor') {
      redirectPath = '/admin/articles'
    } else if (state.currentUser.role === 'reviewer') {
      redirectPath = '/admin/dashboard'
    } else if (state.currentUser.role === 'senior_reviewer') {
      redirectPath = '/admin/dashboard'
    }
    return <Navigate to={redirectPath} replace />
  }

  return children
}
