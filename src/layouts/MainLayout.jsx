import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'

function MainLayout({ currentUser, onLogout }) {
  return (
    <div className="router-shell">
      <Header currentUser={currentUser} onLogout={onLogout} />
      <main className="route-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
