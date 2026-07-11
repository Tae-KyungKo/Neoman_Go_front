import { Navigate, useLocation } from 'react-router-dom'
import { isAdminUser } from '../auth/roles'
import { useAuth } from '../auth/useAuth'

function AdminRoute({ children }) {
  const location = useLocation()
  const { accessToken, authReady, authLoading, currentUser } = useAuth()

  if (!authReady || authLoading) {
    return (
      <div className="placeholder-panel">
        <h2>권한 확인 중</h2>
        <p>현재 사용자 권한 정보를 확인하고 있다.</p>
      </div>
    )
  }

  if (!accessToken || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!currentUser.role) {
    return (
      <div className="placeholder-panel">
        <h2>Admin 권한 확인 중</h2>
        <p>현재 사용자 role 조회가 끝난 뒤 관리자 화면 접근 여부를 판단한다.</p>
      </div>
    )
  }

  if (!isAdminUser(currentUser)) {
    return (
      <div className="placeholder-panel">
        <h2>접근 권한 없음</h2>
        <p>관리자 권한이 있는 계정만 접근할 수 있다.</p>
      </div>
    )
  }

  return children
}

export default AdminRoute
