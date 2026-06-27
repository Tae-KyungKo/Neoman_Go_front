import { Link, useOutletContext } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function CategoryHomePage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const { currentUser } = useAuth()
  const isLoggedIn = Boolean(currentUser?.isLoggedIn)

  return (
    <div className="placeholder-panel">
      <h2>{categoryLabel} 카테고리 홈</h2>
      <p>URL의 categoryCode를 기준으로 팀, 게시판, 매치 화면을 분리한다.</p>

      <div className="quick-link-grid compact">
        <Link to={`/c/${categoryCode}/teams`}>팀 찾기</Link>
        {isLoggedIn ? (
          <Link to={`/c/${categoryCode}/teams/new`}>팀 생성</Link>
        ) : (
          <Link to="/login" state={{ from: { pathname: `/c/${categoryCode}/teams/new` } }}>
            로그인 후 팀 생성
          </Link>
        )}
        <Link to={`/c/${categoryCode}/board`}>자유게시판</Link>
        <Link to={`/c/${categoryCode}/matches`}>매치 조회 준비 중</Link>
      </div>
    </div>
  )
}

export default CategoryHomePage
