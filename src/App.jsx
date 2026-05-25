import { useCallback, useState } from 'react'
import { normalizeApiError } from './api/client'
import './App.css'
import ActionLogPanel from './components/ActionLogPanel'
import CategorySelector from './components/CategorySelector'
import LoginPanel from './components/LoginPanel'
import TeamDetailPanel from './components/TeamDetailPanel'
import TeamListPanel from './components/TeamListPanel'

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

      return team.id
    })
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

      <TeamListPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSelectTeam={handleSelectTeam}
        onSuccess={addSuccessLog}
        selectedCategory={selectedCategory}
        selectedTeamId={selectedTeamId}
      />

      <TeamDetailPanel
        onError={addErrorLog}
        onInfo={addInfoLog}
        onSuccess={addSuccessLog}
        teamId={selectedTeamId}
      />

      <ActionLogPanel logs={logs} />
    </main>
  )
}

export default App
