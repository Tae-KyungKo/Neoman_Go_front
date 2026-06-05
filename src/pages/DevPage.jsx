import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import LegacyDevApp from '../legacy/LegacyDevApp'

function getUserLabel(currentUser) {
  return currentUser?.nickname || currentUser?.email || currentUser?.id || '-'
}

function DevPage() {
  const [isLegacyOpen, setIsLegacyOpen] = useState(true)
  const {
    accessToken,
    authLoading,
    authReady,
    currentUser,
  } = useAuth()

  return (
    <section className="dev-page">
      <div className="route-panel dev-page-header">
        <div className="route-panel-header">
          <div>
            <h1>Dev / Debug</h1>
            <p>이 화면은 개발/검증용 Legacy UI입니다.</p>
          </div>
          <span className="selected-category-badge">DEV ONLY</span>
        </div>

        <div className="dev-notice-grid">
          <p>1차 시연용 화면은 상단 네비게이션의 팀/게시판/공지사항/알림함 라우트를 사용합니다.</p>
          <p>Legacy UI는 API 검증과 문제 재현을 위해 유지합니다.</p>
          <p>Legacy 내부 ActionLog를 사용해 요청/응답 로그를 확인합니다.</p>
        </div>
      </div>

      <section className="route-panel" aria-labelledby="dev-auth-title">
        <div className="route-panel-header">
          <div>
            <h2 id="dev-auth-title">현재 인증 상태</h2>
            <p>민감한 accessToken 전체 값은 표시하지 않습니다.</p>
          </div>
        </div>

        <div className="auth-state">
          <span>authReady: {String(authReady)}</span>
          <span>authLoading: {String(authLoading)}</span>
          <span>loggedIn: {String(Boolean(currentUser?.isLoggedIn))}</span>
          <span>user: {getUserLabel(currentUser)}</span>
          <span>role: {currentUser?.role ?? '-'}</span>
          <span>Access Token: {accessToken ? 'present' : 'none'}</span>
        </div>
      </section>

      <section className="route-panel" aria-labelledby="legacy-ui-title">
        <div className="route-panel-header">
          <div>
            <h2 id="legacy-ui-title">Legacy 검증 UI 영역</h2>
            <p>기존 검증용 단일 페이지 UI를 보존합니다.</p>
          </div>
          <button
            className="button-like"
            onClick={() => setIsLegacyOpen((current) => !current)}
            type="button"
          >
            {isLegacyOpen ? 'Legacy 검증 UI 닫기' : 'Legacy 검증 UI 열기'}
          </button>
        </div>

        {isLegacyOpen ? (
          <div className="legacy-dev-shell">
            <LegacyDevApp />
          </div>
        ) : (
          <p className="empty-log">Legacy 검증 UI가 접혀 있습니다.</p>
        )}
      </section>
    </section>
  )
}

export default DevPage
