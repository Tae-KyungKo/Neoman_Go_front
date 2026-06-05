import { useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ActionLogPanel from '../../components/ActionLogPanel'
import TeamListPanel from '../../components/TeamListPanel'
import { useActionLog } from '../../hooks/useActionLog'

function TeamListPage() {
  const { categoryCode, categoryLabel } = useOutletContext()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { logs, addInfoLog, addSuccessLog, addErrorLog } = useActionLog()
  const selectedCategory = useMemo(() => ({
    code: categoryCode,
    label: categoryLabel,
  }), [categoryCode, categoryLabel])

  function handleSelectTeam(team) {
    navigate(`/c/${categoryCode}/teams/${team.id}`)
  }

  return (
    <section className="team-route-page">
      <div className="route-panel">
        <div className="route-panel-header">
          <div>
            <h2>{categoryLabel} 팀</h2>
            <p>URL categoryCode를 기준으로 팀 목록을 조회한다.</p>
          </div>
          {currentUser?.isLoggedIn ? (
            <Link className="button-link" to={`/c/${categoryCode}/teams/new`}>
              팀 생성
            </Link>
          ) : (
            <Link
              className="button-link"
              state={{ from: { pathname: `/c/${categoryCode}/teams/new` } }}
              to="/login"
            >
              로그인 후 팀 생성
            </Link>
          )}
        </div>
      </div>

      <TeamListPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSelectTeam={handleSelectTeam}
        onSuccess={addSuccessLog}
        refreshKey={categoryCode}
        selectedCategory={selectedCategory}
        selectedTeamId={null}
      />

      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default TeamListPage
