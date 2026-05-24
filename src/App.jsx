import { useState } from 'react'
import { normalizeApiError } from './api/client'
import './App.css'
import ActionLogPanel from './components/ActionLogPanel'

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

  function addLog({ type = 'info', message, status, code, data }) {
    setLogs((currentLogs) => [
      createLogEntry({ type, message, status, code, data }),
      ...currentLogs,
    ])
  }

  function addSuccessLog(message, data) {
    addLog({
      type: 'success',
      message,
      data,
    })
  }

  function addErrorLog(error) {
    const normalizedError = normalizeApiError(error)

    addLog({
      type: 'error',
      message: normalizedError.message,
      status: normalizedError.status,
      code: normalizedError.code,
      data: normalizedError.data,
    })
  }

  function clearLogs() {
    setLogs([])
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

      <ActionLogPanel logs={logs} />
    </main>
  )
}

export default App
