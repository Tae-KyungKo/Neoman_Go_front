import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'

function MainLayout() {
  return (
    <div className="router-shell">
      <Header />
      <main className="route-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
