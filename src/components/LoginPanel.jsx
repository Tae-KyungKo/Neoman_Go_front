import { useState } from 'react'
import { login } from '../api/authApi'
import { clearTokens, saveTokens } from '../auth/tokenStorage'

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
  const [loginId, setLoginId] = useState(currentUser?.loginId ?? '')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const nextUser = onLoginSubmit
        ? await onLoginSubmit({ loginId, password })
        : null
      const response = onLoginSubmit
        ? null
        : await login({
            loginId,
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

        const tokenData = response?.data?.data ?? response?.data ?? {}

        saveTokens({
          accessToken,
          refreshToken,
          tokenType: tokenData.tokenType ?? 'Bearer',
          accessTokenExpiresIn: tokenData.accessTokenExpiresIn,
        })
      }

      setCurrentUser(nextUser ?? {
        isLoggedIn: true,
        loginId,
        accessToken,
      })
      setPassword('')
      onSuccess?.('Login completed.', {
        loginId,
        hasAccessToken: true,
      })
    } catch (error) {
      const normalizedError = onError?.(error)
      setErrorMessage(
        normalizedError?.message ?? 'Login failed.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    if (onLogoutClick) {
      await onLogoutClick()
    } else {
      clearTokens()
    }

    setCurrentUser({
      isLoggedIn: false,
      loginId: '',
      accessToken: '',
    })
    setPassword('')
    setErrorMessage('')
    onSuccess?.('Logout completed.')
  }

  const isLoggedIn = Boolean(currentUser?.isLoggedIn || currentUser?.accessToken)

  return (
    <section className="login-panel" aria-labelledby="login-panel-title">
      <div className="panel-header">
        <div>
          <h2 id="login-panel-title">Login</h2>
          <p>Sign in with your NeomanGo account.</p>
        </div>
        <span className={isLoggedIn ? 'auth-on' : 'auth-off'}>
          {isLoggedIn ? 'Logged in' : 'Guest'}
        </span>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <label>
          Login ID
          <input
            autoComplete="username"
            disabled={isSubmitting}
            onChange={(event) => setLoginId(event.target.value)}
            placeholder="Enter login ID"
            type="text"
            value={loginId}
          />
        </label>

        <label>
          Password
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
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
          <button
            disabled={!isLoggedIn || isSubmitting}
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </form>

      <div className="auth-state">
        <span>Access Token: {currentUser?.accessToken ? 'present' : 'none'}</span>
        {currentUser?.nickname || currentUser?.loginId || currentUser?.email ? (
          <span>
            Account: {currentUser.nickname || currentUser.loginId || currentUser.email}
          </span>
        ) : null}
        {currentUser?.role ? <span>Role: {currentUser.role}</span> : null}
      </div>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  )
}

export default LoginPanel
