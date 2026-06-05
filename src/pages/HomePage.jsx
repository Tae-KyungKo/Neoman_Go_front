import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="route-panel">
      <div className="route-panel-header">
        <div>
          <h1>너만고 시연 홈</h1>
          <p>Phase 7.5에서는 기존 검증용 UI를 유지하면서 라우트 기반 화면 흐름을 정리한다.</p>
        </div>
      </div>

      <div className="quick-link-grid">
        <Link to="/c/LOL">LOL 카테고리</Link>
        <Link to="/c/SOCCER">축구 카테고리</Link>
        <Link to="/notices">공지사항</Link>
        <Link to="/notifications">알림함</Link>
        <Link to="/dev">기존 검증 UI</Link>
      </div>
    </section>
  )
}

export default HomePage
