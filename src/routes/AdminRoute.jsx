import { Navigate, useLocation } from 'react-router-dom'

function AdminRoute({ children, currentUser }) {
  const location = useLocation()

  if (!currentUser?.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // TODO(Phase 7.5-2): currentUser 로딩 상태와 role 소스가 정리되면 ADMIN 판정을 더 엄격하게 처리한다.
  if (!currentUser.role) {
    return (
      <div className="placeholder-panel">
        <h2>Admin 권한 확인 중</h2>
        <p>현재 사용자 role 조회가 끝난 뒤 관리자 화면 접근 여부를 판단한다.</p>
      </div>
    )
  }

  if (currentUser.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
