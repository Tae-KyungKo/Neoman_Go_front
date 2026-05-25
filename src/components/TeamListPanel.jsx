import { useEffect, useState } from 'react'
import { getTeams } from '../api/teamApi'

function extractTeamPage(response) {
  return response?.data?.data ?? {}
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

function TeamListPanel({
  selectedCategory,
  selectedTeamId,
  refreshKey,
  onSelectTeam,
  onInfo,
  onSuccess,
  onError,
}) {
  const [teams, setTeams] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    let ignore = false

    async function loadTeams() {
      setIsLoading(true)
      setErrorMessage('')
      onInfo(`팀 목록 조회 시작: ${selectedCategory.code}`, {
        category: selectedCategory.code,
      })

      try {
        const response = await getTeams({ category: selectedCategory.code })
        const page = extractTeamPage(response)
        const content = Array.isArray(page.content) ? page.content : []

        if (ignore) {
          return
        }

        setTeams(content)
        setPageInfo({
          number: page.number,
          size: page.size,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        })
        onSuccess(`팀 목록 조회 완료: ${selectedCategory.code}`, {
          category: selectedCategory.code,
          count: content.length,
          totalElements: page.totalElements,
        })
      } catch (error) {
        if (ignore) {
          return
        }

        const normalizedError = onError(
          error,
          `팀 목록 조회 실패: ${selectedCategory.code}`,
        )
        setTeams([])
        setPageInfo(null)
        setErrorMessage(
          normalizedError?.message ?? '팀 목록 조회 중 오류가 발생했습니다.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTeams()

    return () => {
      ignore = true
    }
  }, [selectedCategory, refreshKey, onError, onInfo, onSuccess])

  return (
    <section className="team-list-panel" aria-labelledby="team-list-title">
      <div className="panel-header">
        <div>
          <h2 id="team-list-title">Teams</h2>
          <p>선택한 카테고리의 팀 목록을 조회합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory ? selectedCategory.code : 'NO_CATEGORY'}
        </span>
      </div>

      {!selectedCategory ? (
        <p className="empty-log">카테고리를 선택하면 팀 목록을 조회합니다.</p>
      ) : null}

      {selectedCategory && isLoading ? (
        <p className="empty-log">팀 목록을 조회하는 중입니다.</p>
      ) : null}

      {selectedCategory && errorMessage ? (
        <p className="form-error">{errorMessage}</p>
      ) : null}

      {selectedCategory && !isLoading && !errorMessage && teams.length === 0 ? (
        <p className="empty-log">해당 카테고리에 등록된 팀이 없습니다.</p>
      ) : null}

      {selectedCategory && teams.length > 0 ? (
        <>
          <div className="team-list-meta">
            <span>조회 결과 {teams.length}개</span>
            {typeof pageInfo?.totalElements === 'number' ? (
              <span>전체 {pageInfo.totalElements}개</span>
            ) : null}
          </div>

          <ul className="team-list">
            {teams.map((team) => {
              const isSelected = selectedTeamId === team.id

              return (
                <li key={team.id}>
                  <button
                    aria-pressed={isSelected}
                    className={isSelected ? 'team-card selected' : 'team-card'}
                    onClick={() => onSelectTeam(team)}
                    type="button"
                  >
                    <span className="team-card-title">{team.name}</span>
                    <span className="team-card-meta">ID {team.id}</span>
                    <span className="team-card-meta">
                      {team.category} · {team.status}
                    </span>
                    <span className="team-card-meta">
                      OWNER {team.ownerNickname}({team.ownerId})
                    </span>
                    <span className="team-card-meta">
                      생성일 {formatDate(team.createdAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </section>
  )
}

export default TeamListPanel
