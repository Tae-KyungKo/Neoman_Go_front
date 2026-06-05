import { Link, useParams } from 'react-router-dom'

function CategoryHomePage() {
  const { categoryCode } = useParams()

  return (
    <div className="placeholder-panel">
      <h2>{categoryCode} 카테고리 홈</h2>
      <p>팀, 게시판, 매치 화면의 실제 기능 이관은 이후 Step에서 진행한다.</p>
      <div className="quick-link-grid compact">
        <Link to={`/c/${categoryCode}/teams`}>팀 목록</Link>
        <Link to={`/c/${categoryCode}/board`}>게시판</Link>
        <Link to={`/c/${categoryCode}/matches`}>매치 준비 중</Link>
      </div>
    </div>
  )
}

export default CategoryHomePage
