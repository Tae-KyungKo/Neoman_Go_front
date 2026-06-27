import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { accessToken, authReady, authLoading, currentUser } = useAuth()

  if (!authReady || authLoading) {
    return (
      <div className="placeholder-panel">
        <h2>인증 상태 확인 중</h2>
        <p>저장된 로그인 정보를 확인하고 있다.</p>
      </div>
    )
  }

  if (!accessToken || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
