import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { state } = useApp()
  const location = useLocation()

  if (!state.currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(state.currentUser.role)) {
    const redirectPath =
      state.currentUser.role === 'editor' ? '/admin/articles' : '/admin/review'
    return <Navigate to={redirectPath} replace />
  }

  return children
}
