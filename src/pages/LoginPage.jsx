import { Link, useLocation, useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import LoginPanel from '../components/LoginPanel'
import { useActionLog } from '../hooks/useActionLog'

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const signupMessage = location.state?.signupMessage
  const { addSuccessLog, addErrorLog } = useActionLog()

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
    </section>
  )
}

export default LoginPage
