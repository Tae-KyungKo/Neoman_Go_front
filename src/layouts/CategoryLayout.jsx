import { NavLink, Outlet, useParams } from 'react-router-dom'
import {
  getCategoryLabel,
  isValidCategoryCode,
  normalizeCategoryCode,
} from '../constants/categories'

function CategoryLayout() {
  const params = useParams()
  const categoryCode = normalizeCategoryCode(params.categoryCode)
  const categoryLabel = getCategoryLabel(categoryCode)

  if (!isValidCategoryCode(categoryCode)) {
    return (
      <section className="route-panel">
        <div className="route-panel-header">
          <div>
            <h1>지원하지 않는 카테고리입니다</h1>
            <p>
              URL categoryCode <code>{params.categoryCode}</code>는 현재 지원 목록에 없다.
            </p>
          </div>
        </div>
        <NavLink className="button-link" to="/">
          홈으로 돌아가기
        </NavLink>
      </section>
    )
  }

  return (
    <section className="route-panel category-layout">
      <div className="route-panel-header">
        <div>
          <h1>{categoryLabel}</h1>
          <p>
            URL categoryCode: <code>{categoryCode}</code>
          </p>
        </div>
        <span className="selected-category-badge">{categoryLabel}</span>
      </div>

      <nav className="sub-navigation" aria-label={`${categoryLabel} navigation`}>
        <NavLink to={`/c/${categoryCode}`} end>
          카테고리 홈
        </NavLink>
        <NavLink to={`/c/${categoryCode}/teams`}>팀</NavLink>
        <NavLink to={`/c/${categoryCode}/board`}>게시판</NavLink>
        <NavLink to={`/c/${categoryCode}/matches`}>매치 준비 중</NavLink>
      </nav>

      <Outlet context={{ categoryCode, categoryLabel }} />
    </section>
  )
}

export default CategoryLayout
