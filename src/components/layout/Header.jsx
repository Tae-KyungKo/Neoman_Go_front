import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import NotificationBell from '../notifications/NotificationBell'
import MainNavigation from './MainNavigation'

function Header() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const displayName = currentUser?.nickname || currentUser?.email || 'Guest'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="app-header">
      <div className="brand-area">
        <NavLink className="brand-link" to="/">
          NeomanGo
        </NavLink>
        <span className={currentUser?.isLoggedIn ? 'auth-on' : 'auth-off'}>
          {currentUser?.isLoggedIn ? 'Logged in' : 'Guest'}
        </span>
      </div>

      <MainNavigation />

      <div className="header-actions">
        <span className="user-chip">{displayName}</span>
        {currentUser?.role ? <span className="user-chip">{currentUser.role}</span> : null}
        <NotificationBell />
        {currentUser?.isLoggedIn ? (
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <>
            <NavLink className="button-link" to="/login">
              로그인
            </NavLink>
            <NavLink className="button-link" to="/signup">
              회원가입
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
