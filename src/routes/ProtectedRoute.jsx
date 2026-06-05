import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children, currentUser }) {
  const location = useLocation()

  if (!currentUser?.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
