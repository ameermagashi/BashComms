import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// role is optional. Example: <ProtectedRoute role="admin">
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  // Not logged in? Go to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Wrong role? Go back home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute