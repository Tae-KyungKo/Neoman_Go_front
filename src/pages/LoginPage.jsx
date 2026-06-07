import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
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

function LoginPage() {
  const [logs, setLogs] = useState([])
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const signupMessage = location.state?.signupMessage

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

  async function handleLogin(credentials) {
    const user = await auth.login(credentials)
    navigate(from, { replace: true })
    return user
  }

  return (
    <section className="login-page">
      <LoginPanel
        currentUser={auth.currentUser ?? {
          isLoggedIn: Boolean(auth.accessToken),
          accessToken: auth.accessToken,
          email: '',
        }}
        onError={addErrorLog}
        onLoginSubmit={handleLogin}
        onLogoutClick={auth.logout}
        onSuccess={addSuccessLog}
        setCurrentUser={() => {}}
      />
      {signupMessage ? (
        <div className="placeholder-panel">
          <h2>회원가입 완료</h2>
          <p>{signupMessage}</p>
        </div>
      ) : null}
      <div className="placeholder-panel">
        <h2>계정이 없나요?</h2>
        <div className="login-actions">
          <Link className="button-link" to="/signup">
            회원가입
          </Link>
        </div>
      </div>
      {auth.authError ? (
        <div className="placeholder-panel">
          <h2>인증 오류</h2>
          <p>{normalizeApiError(auth.authError).message}</p>
        </div>
      ) : null}
      <ActionLogPanel logs={logs} />
    </section>
  )
}

export default LoginPage
