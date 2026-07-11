import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import NotificationBell from '../notifications/NotificationBell'
import MainNavigation from './MainNavigation'

function Header() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const displayName = currentUser?.nickname || currentUser?.email || 'Guest'

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate('/', { replace: true })
    }
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
          <button type="button" disabled={isLoggingOut} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <NavLink className="button-link" to="/login">
              Login
            </NavLink>
            <NavLink className="button-link" to="/signup">
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
