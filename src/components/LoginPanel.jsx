import { useState } from 'react'
import { login } from '../api/authApi'
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from '../auth/AuthContextValue'

function getTokenPreview(accessToken) {
  if (!accessToken) {
    return ''
  }

  return `${accessToken.slice(0, 12)}...`
}

function extractAccessToken(response) {
  return (
    response?.data?.data?.accessToken ??
    response?.data?.accessToken ??
    response?.data?.result?.accessToken ??
    null
  )
}

function extractRefreshToken(response) {
  return (
    response?.data?.data?.refreshToken ??
    response?.data?.refreshToken ??
    response?.data?.result?.refreshToken ??
    null
  )
}

function LoginPanel({
  currentUser,
  setCurrentUser,
  onSuccess,
  onError,
  onLoginSubmit,
  onLogoutClick,
}) {
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const nextUser = onLoginSubmit
        ? await onLoginSubmit({ email, password })
        : null
      const response = onLoginSubmit
        ? null
        : await login({
            email,
            password,
          })
      const accessToken = nextUser?.accessToken ?? extractAccessToken(response)
      const refreshToken = response ? extractRefreshToken(response) : null

      if (!accessToken) {
        throw new Error('Login response does not include accessToken.')
      }

      if (!onLoginSubmit) {
        if (!refreshToken) {
          throw new Error('Login response does not include refreshToken.')
        }

        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
      }

      setCurrentUser(nextUser ?? {
        isLoggedIn: true,
        email,
        accessToken,
      })
      setPassword('')
      onSuccess('로그인 완료', {
        email,
        hasAccessToken: true,
      })
    } catch (error) {
      const normalizedError = onError(error)
      setErrorMessage(
        normalizedError?.message ?? '로그인 처리 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    if (onLogoutClick) {
      onLogoutClick()
    } else {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    }

    setCurrentUser({
      isLoggedIn: false,
      email: '',
      accessToken: '',
    })
    setPassword('')
    setErrorMessage('')
    onSuccess('로그아웃 완료')
  }

  const isLoggedIn = Boolean(currentUser?.isLoggedIn || currentUser?.accessToken)

  return (
    <section className="login-panel" aria-labelledby="login-panel-title">
      <div className="panel-header">
        <div>
          <h2 id="login-panel-title">Login</h2>
          <p>JWT Access Token 저장과 인증 API 호출 상태를 확인합니다.</p>
        </div>
        <span className={isLoggedIn ? 'auth-on' : 'auth-off'}>
          {isLoggedIn ? '로그인' : '비로그인'}
        </span>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <label>
          이메일
          <input
            autoComplete="email"
            disabled={isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            type="email"
            value={email}
          />
        </label>

        <label>
          비밀번호
          <input
            autoComplete="current-password"
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            type="password"
            value={password}
          />
        </label>

        <div className="login-actions">
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
          <button
            disabled={!isLoggedIn}
            onClick={handleLogout}
            type="button"
          >
            로그아웃
          </button>
        </div>
      </form>

      <div className="auth-state">
        <span>
          Access Token:{' '}
          {currentUser?.accessToken
            ? getTokenPreview(currentUser.accessToken)
            : '저장되지 않음'}
        </span>
        {currentUser?.email ? <span>계정: {currentUser.email}</span> : null}
        {currentUser?.role ? <span>Role: {currentUser.role}</span> : null}
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default LoginPanel
