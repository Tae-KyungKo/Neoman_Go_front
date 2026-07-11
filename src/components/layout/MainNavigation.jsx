import { NavLink } from 'react-router-dom'
import { isAdminUser } from '../../auth/roles'
import { useAuth } from '../../auth/useAuth'

function MainNavigation() {
  const { currentUser } = useAuth()

  return (
    <nav className="main-navigation" aria-label="Global navigation">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/notices">Notices</NavLink>
      <NavLink to="/c/LOL">LOL</NavLink>
      <NavLink to="/c/SOCCER">Soccer</NavLink>
      {isAdminUser(currentUser) ? <NavLink to="/admin">Admin</NavLink> : null}
    </nav>
  )
}

export default MainNavigation
