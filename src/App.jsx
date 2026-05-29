import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from './api/client'
import { getCurrentUser } from './api/userApi'
import './App.css'
import ActionLogPanel from './components/ActionLogPanel'
import CategorySelector from './components/CategorySelector'
import LoginPanel from './components/LoginPanel'
import MyTeamApplicationsPanel from './components/MyTeamApplicationsPanel'
import OwnerTeamApplicationsPanel from './components/OwnerTeamApplicationsPanel'
import TeamCreatePanel from './components/TeamCreatePanel'
import TeamApplicationPanel from './components/TeamApplicationPanel'
import TeamDetailPanel from './components/TeamDetailPanel'
import TeamListPanel from './components/TeamListPanel'
import TeamMemberManagementPanel from './components/TeamMemberManagementPanel'

function createLogEntry({ type, message, status, code, data }) {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    status,
    code,
    data,
    timestamp: new Date().toISOString(),
  }
}

function App() {
  const [logs, setLogs] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedTeamDetail, setSelectedTeamDetail] = useState(null)
  const [myApplications, setMyApplications] = useState([])
  const [applicationRefreshKey, setApplicationRefreshKey] = useState(0)
  const [ownerApplicationRefreshKey, setOwnerApplicationRefreshKey] = useState(0)
  const [teamDetailRefreshKey, setTeamDetailRefreshKey] = useState(0)
  const [teamListRefreshKey, setTeamListRefreshKey] = useState(0)
  const [currentUser, setCurrentUser] = useState(() => {
    const accessToken = localStorage.getItem('accessToken') ?? ''

    return {
      isLoggedIn: Boolean(accessToken),
      email: '',
      accessToken,
    }
  })

  const addLog = useCallback(function addLog({
    type = 'info',
    message,
    status,
    code,
    data,
  }) {
    setLogs((currentLogs) => [
      createLogEntry({ type, message, status, code, data }),
      ...currentLogs,
    ])
  }, [])

  const addSuccessLog = useCallback(function addSuccessLog(message, data) {
    addLog({
      type: 'success',
      message,
      data,
    })
  }, [addLog])

  const addInfoLog = useCallback(function addInfoLog(message, data) {
    addLog({
      type: 'info',
      message,
      data,
    })
  }, [addLog])

  const addErrorLog = useCallback(function addErrorLog(error, message) {
    const normalizedError = normalizeApiError(error)

    addLog({
      type: 'error',
      message: message ?? normalizedError.message,
      status: normalizedError.status,
      code: normalizedError.code,
      data: normalizedError.data,
    })

    return normalizedError
  }, [addLog])

  function clearLogs() {
    setLogs([])
  }

  function handleSelectCategory(category) {
    setSelectedCategory(category)
    setSelectedTeamId(null)
    setSelectedTeamDetail(null)
    addSuccessLog(`카테고리 선택: ${category.label}(${category.code})`, {
      categoryCode: category.code,
      categoryLabel: category.label,
    })
  }

  function handleSelectTeam(team) {
    setSelectedTeamId((currentTeamId) => {
      if (currentTeamId === team.id) {
        return currentTeamId
      }

      setSelectedTeamDetail(null)
      return team.id
    })
  }

  function handleTeamCreated(team) {
    setTeamListRefreshKey((currentKey) => currentKey + 1)
    if (team?.id) {
      setSelectedTeamId(team.id)
      setSelectedTeamDetail(null)
    }
  }

  const handleTeamLoaded = useCallback(function handleTeamLoaded(team) {
    setSelectedTeamDetail(team)
  }, [])

  const handleApplicationsLoaded = useCallback(
    function handleApplicationsLoaded(applications) {
      setMyApplications(applications)
    },
    [],
  )

  function handleApplicationChanged() {
    setApplicationRefreshKey((currentKey) => currentKey + 1)
    setTeamDetailRefreshKey((currentKey) => currentKey + 1)
    setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
  }

  function handleApplicationReviewed({ refreshTeamDetail = false } = {}) {
    setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
    setApplicationRefreshKey((currentKey) => currentKey + 1)

    if (refreshTeamDetail) {
      setTeamDetailRefreshKey((currentKey) => currentKey + 1)
    }
  }

  function handleTeamMemberChanged({
    clearSelectedTeam = false,
    refreshOwnerApplications = false,
    teamMayBeDeleted = false,
  } = {}) {
    setTeamListRefreshKey((currentKey) => currentKey + 1)

    if (clearSelectedTeam) {
      setSelectedTeamId(null)
      setSelectedTeamDetail(null)
    } else {
      setTeamDetailRefreshKey((currentKey) => currentKey + 1)
    }

    if (refreshOwnerApplications || teamMayBeDeleted) {
      setOwnerApplicationRefreshKey((currentKey) => currentKey + 1)
    }
  }

  function addSampleErrorLog() {
    addErrorLog({
      response: {
        status: 409,
        data: {
          code: 'DUPLICATE_APPLICATION',
          message: '이미 가입 신청한 팀입니다.',
        },
      },
    })
  }

  useEffect(() => {
    if (!currentUser.accessToken || currentUser.id) {
      return
    }

    let ignore = false

    async function loadCurrentUser() {
      try {
        const response = await getCurrentUser()
        const me = response?.data?.data

        if (ignore || !me) {
          return
        }

        setCurrentUser((user) => {
          if (user.accessToken !== currentUser.accessToken) {
            return user
          }

          return {
            ...user,
            id: me.id,
            email: user.email || me.email,
            nickname: me.nickname,
            role: me.role,
            status: me.status,
          }
        })
      } catch {
        // 현재 사용자 식별 실패는 팀원 관리 버튼 비활성화로 처리한다.
      }
    }

    loadCurrentUser()

    return () => {
      ignore = true
    }
  }, [currentUser.accessToken, currentUser.id])

  return (
    <main className="app-shell">
      <section className="intro-panel">
        <div>
          <h1>NeomanGo API Test UI</h1>
          <p>
            Phase 4.5 검증용 UI에서 공통으로 사용할 ActionLogPanel을
            확인합니다.
          </p>
        </div>

        <div className="test-actions" aria-label="로그 테스트 버튼">
          <button
            type="button"
            onClick={() => addSuccessLog('샘플 성공 로그가 추가되었습니다.')}
          >
            성공 로그 추가
          </button>
          <button type="button" onClick={addSampleErrorLog}>
            실패 로그 추가
          </button>
          <button type="button" onClick={clearLogs}>
            로그 초기화
          </button>
        </div>
      </section>

      <LoginPanel
        currentUser={currentUser}
        onError={addErrorLog}
        onSuccess={addSuccessLog}
        setCurrentUser={setCurrentUser}
      />

      <CategorySelector
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
      />

      <TeamCreatePanel
        currentUser={currentUser}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        onTeamCreated={handleTeamCreated}
        selectedCategory={selectedCategory}
      />

      <TeamListPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSelectTeam={handleSelectTeam}
        onSuccess={addSuccessLog}
        refreshKey={teamListRefreshKey}
        selectedCategory={selectedCategory}
        selectedTeamId={selectedTeamId}
      />

      <TeamDetailPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        onTeamLoaded={handleTeamLoaded}
        refreshKey={teamDetailRefreshKey}
        teamId={selectedTeamId}
      />

      {selectedTeamDetail ? (
        <TeamMemberManagementPanel
          key={`${currentUser.accessToken || 'guest'}-${selectedTeamId || 'none'}`}
          currentUser={currentUser}
          onError={addErrorLog}
          onInfo={addInfoLog}
          onMemberChanged={handleTeamMemberChanged}
          onSuccess={addSuccessLog}
          team={selectedTeamDetail}
        />
      ) : null}

      <TeamApplicationPanel
        currentUser={currentUser}
        myApplications={myApplications}
        onApplicationChanged={handleApplicationChanged}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        team={selectedTeamDetail}
      />

      <OwnerTeamApplicationsPanel
        key={`${currentUser.accessToken || 'guest'}-${selectedTeamId || 'none'}`}
        currentUser={currentUser}
        onApplicationReviewed={handleApplicationReviewed}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        refreshKey={ownerApplicationRefreshKey}
        team={selectedTeamDetail}
      />

      <MyTeamApplicationsPanel
        key={currentUser.accessToken || 'guest'}
        currentUser={currentUser}
        onApplicationChanged={handleApplicationChanged}
        onApplicationsLoaded={handleApplicationsLoaded}
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        refreshKey={applicationRefreshKey}
      />

      <ActionLogPanel logs={logs} />
    </main>
  )
}

export default App


