import { useEffect, useState } from 'react'
import { getTeam } from '../api/teamApi'

function extractTeamDetail(response) {
  return response?.data?.data ?? null
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function TeamDetailPanel({ teamId, onInfo, onSuccess, onError }) {
  const [team, setTeam] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!teamId) {
      return
    }

    let ignore = false

    async function loadTeamDetail() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo(`팀 상세 조회 시작: teamId=${teamId}`, { teamId })

      try {
        const response = await getTeam(teamId)
        const detail = extractTeamDetail(response)

        if (ignore) {
          return
        }

        setTeam(detail)
        onSuccess(`팀 상세 조회 완료: teamId=${teamId}`, { teamId })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(error, `팀 상세 조회 실패: teamId=${teamId}`)
        setTeam(null)
        setErrorMessage(
          normalizedError?.message ?? '팀 상세 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTeamDetail()

    return () => {
      ignore = true
    }
  }, [teamId, onError, onInfo, onSuccess])

  return (
    <section className="team-detail-panel" aria-labelledby="team-detail-title">
      <div className="panel-header">
        <div>
          <h2 id="team-detail-title">Team Detail</h2>
          <p>팀 목록에서 선택한 팀의 상세 정보를 조회합니다.</p>
        </div>
        <span className="selected-category-badge">
          {teamId ? `teamId=${teamId}` : '선택 없음'}
        </span>
      </div>

      {!teamId ? (
        <p className="empty-log">팀을 선택하면 상세 정보를 조회합니다.</p>
      ) : null}

      {teamId && isLoading ? (
        <p className="empty-log">팀 상세 정보를 조회하는 중입니다.</p>
      ) : null}

      {teamId && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {teamId && team && !isLoading && !errorMessage ? (
        <div className="team-detail">
          <div className="team-detail-header">
            <div>
              <h3>{team.name}</h3>
              <p>{team.description || '소개가 없습니다.'}</p>
            </div>
            <span className="status-badge">{team.status}</span>
          </div>

          <dl className="team-detail-grid">
            <div>
              <dt>팀 ID</dt>
              <dd>{team.id}</dd>
            </div>
            <div>
              <dt>카테고리</dt>
              <dd>{team.category}</dd>
            </div>
            <div>
              <dt>생성일</dt>
              <dd>{formatDate(team.createdAt)}</dd>
            </div>
            <div>
              <dt>OWNER</dt>
              <dd>
                {team.owner?.nickname}({team.owner?.userId})
              </dd>
            </div>
          </dl>

          <div className="member-section">
            <h3>Members</h3>
            {Array.isArray(team.members) && team.members.length > 0 ? (
              <ul className="member-list">
                {team.members.map((member) => (
                  <li key={`${member.userId}-${member.role}`}>
                    <span>{member.nickname}</span>
                    <span>{member.role}</span>
                    <span>{member.status}</span>
                    <span>{formatDate(member.joinedAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-log">표시할 팀원이 없습니다.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TeamDetailPanel
