import { Link } from 'react-router-dom'
import { TEAM_CATEGORIES } from '../constants/categories'

function HomePage() {
  return (
    <section className="route-panel">
      <div className="route-panel-header">
        <div>
          <h1>너만고 시연 홈</h1>
          <p>Phase 7.5에서는 기존 검증용 UI를 유지하면서 라우트 기반 화면 흐름을 정리한다.</p>
        </div>
      </div>

      <div className="category-grid" aria-label="카테고리 진입">
        {TEAM_CATEGORIES.map((category) => (
          <Link
            className="category-button"
            key={category.code}
            to={`/c/${category.code}`}
          >
            <span>{category.label}</span>
            <small>{category.code}</small>
          </Link>
        ))}
      </div>

      <div className="quick-link-grid compact">
        <Link to="/notices">공지사항</Link>
        <Link to="/notifications">알림함</Link>
      </div>
    </section>
  )
}

export default HomePage
