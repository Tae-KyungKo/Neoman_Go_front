import { useCallback, useState } from 'react'
import { normalizeApiError } from '../api/client'
import ActionLogPanel from '../components/ActionLogPanel'
import LoginPanel from '../components/LoginPanel'

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

function LoginPage({ currentUser, setCurrentUser }) {
  const [logs, setLogs] = useState([])

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

  return (
    <section className="login-page">
      <LoginPanel
        currentUser={currentUser}
        onError={addErrorLog}
        onSuccess={addSuccessLog}
        setCurrentUser={setCurrentUser}
      />
      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default LoginPage
