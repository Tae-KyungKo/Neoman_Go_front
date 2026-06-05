import { NavLink } from 'react-router-dom'
import MainNavigation from './MainNavigation'

function Header({ currentUser, onLogout }) {
  const displayName = currentUser?.nickname || currentUser?.email || 'Guest'

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
        <NavLink className="notification-link" to="/notifications">
          알림함
        </NavLink>
        {currentUser?.isLoggedIn ? (
          <button type="button" onClick={onLogout}>
            로그아웃
          </button>
        ) : (
          <NavLink className="button-link" to="/login">
            로그인
          </NavLink>
        )}
      </div>
    </header>
  )
}

export default Header
