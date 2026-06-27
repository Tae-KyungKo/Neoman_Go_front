import { NavLink, Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <section className="route-panel admin-layout">
      <div className="route-panel-header">
        <div>
          <h1>Admin</h1>
          <p>관리자 기능은 Phase 7.5에서 시연용 화면 흐름만 먼저 분리한다.</p>
        </div>
      </div>

      <nav className="sub-navigation" aria-label="Admin navigation">
        <NavLink to="/admin" end>
          대시보드
        </NavLink>
        <NavLink to="/admin/notices">공지 관리</NavLink>
      </nav>

      <Outlet />
    </section>
  )
}

export default AdminLayout
