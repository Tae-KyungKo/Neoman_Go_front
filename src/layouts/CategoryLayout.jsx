import { NavLink, Outlet, useParams } from 'react-router-dom'

function CategoryLayout() {
  const { categoryCode } = useParams()

  return (
    <section className="route-panel category-layout">
      <div className="route-panel-header">
        <div>
          <h1>Category</h1>
          <p>
            URL categoryCode: <code>{categoryCode}</code>
          </p>
        </div>
      </div>

      <nav className="sub-navigation" aria-label="Category navigation">
        <NavLink to={`/c/${categoryCode}/teams`}>팀</NavLink>
        <NavLink to={`/c/${categoryCode}/board`}>게시판</NavLink>
        <NavLink to={`/c/${categoryCode}/matches`}>매치 준비 중</NavLink>
      </nav>

      <Outlet />
    </section>
  )
}

export default CategoryLayout
