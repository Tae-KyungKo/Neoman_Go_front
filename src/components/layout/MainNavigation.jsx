import { NavLink } from 'react-router-dom'

function MainNavigation() {
  return (
    <nav className="main-navigation" aria-label="Global navigation">
      <NavLink to="/" end>
        홈
      </NavLink>
      <NavLink to="/notices">공지사항</NavLink>
      <NavLink to="/c/LOL">LOL</NavLink>
      <NavLink to="/c/SOCCER">축구</NavLink>
      <NavLink to="/admin">관리자</NavLink>
      <NavLink to="/dev">Dev</NavLink>
    </nav>
  )
}

export default MainNavigation
