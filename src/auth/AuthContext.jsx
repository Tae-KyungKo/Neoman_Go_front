import { useCallback, useEffect, useMemo, useState } from 'react'
import { login as requestLogin, logout as requestLogout } from '../api/authApi'
import { getCurrentUser } from '../api/userApi'
import {
  refreshTokensOnce,
  registerAuthFailureHandler,
  signalLogoutFinished,
  signalLogoutStarted,
} from './authSession'
import {
  AuthContext,
} from './AuthContextValue'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './tokenStorage'

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

function normalizeUser(me, accessToken, loginId = '') {
  if (!me) {
    return {
      isLoggedIn: Boolean(accessToken),
      accessToken,
      loginId,
    }
  }

  return {
    ...me,
    isLoggedIn: true,
    accessToken,
    loginId: me.loginId || loginId,
  }
}

function isAuthFailure(error) {
  const status = error?.response?.status
  return status === 401 || status === 403
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getAccessToken)
  const [refreshToken, setRefreshToken] = useState(getRefreshToken)
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(() => !getAccessToken())
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const clearAuth = useCallback(function clearAuth() {
    clearTokens()
    setAccessToken('')
    setRefreshToken('')
    setCurrentUser(null)
    setAuthError(null)
    setAuthReady(true)
    setAuthLoading(false)
  }, [])

  const loadMe = useCallback(async function loadMe(token = getAccessToken()) {
    if (!token) {
      clearAuth()
      return null
    }

    setAuthLoading(true)
    setAuthError(null)

    try {
      const response = await getCurrentUser()
      const me = response?.data?.data
      const nextUser = normalizeUser(me, token)

      setAccessToken(getAccessToken())
      setRefreshToken(getRefreshToken())
      setCurrentUser(nextUser)
      setAuthReady(true)
      return nextUser
    } catch (error) {
      if (isAuthFailure(error)) {
        clearAuth()
        return null
      }

      setAuthError(error)
      setCurrentUser(null)
      setAuthReady(true)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [clearAuth])

  const login = useCallback(async function login(credentials) {
    setAuthLoading(true)
    setAuthError(null)
    setCurrentUser(null)

    try {
      const response = await requestLogin(credentials)
      const nextAccessToken = extractAccessToken(response)
      const nextRefreshToken = extractRefreshToken(response)

      if (!nextAccessToken) {
        throw new Error('Login response does not include accessToken.')
      }

      if (!nextRefreshToken) {
        throw new Error('Login response does not include refreshToken.')
      }

      const tokenData = response?.data?.data ?? response?.data ?? {}

      saveTokens({
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
        tokenType: tokenData.tokenType ?? 'Bearer',
        accessTokenExpiresIn: tokenData.accessTokenExpiresIn,
      })
      setAccessToken(nextAccessToken)
      setRefreshToken(nextRefreshToken)

      try {
        return await loadMe(nextAccessToken)
      } catch (error) {
        if (isAuthFailure(error)) {
          throw error
        }

        const fallbackUser = normalizeUser(null, nextAccessToken, credentials.loginId)
        setCurrentUser(fallbackUser)
        setAuthReady(true)
        return fallbackUser
      }
    } catch (error) {
      clearTokens()
      setAccessToken('')
      setRefreshToken('')
      setCurrentUser(null)
      setAuthError(error)
      setAuthReady(true)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [loadMe])

  const logout = useCallback(async function logout() {
    signalLogoutStarted()

    try {
      await requestLogout()
    } catch {
      // Local logout must complete even if the server-side token cleanup fails.
    } finally {
      clearAuth()
      signalLogoutFinished()
    }
  }, [clearAuth])

  const reissueAccessToken = useCallback(async function reissueAccessToken() {
    const nextAccessToken = await refreshTokensOnce()
    setAccessToken(nextAccessToken)
    setRefreshToken(getRefreshToken())
    setAuthReady(true)

    return nextAccessToken
  }, [])

  useEffect(() => {
    const unregister = registerAuthFailureHandler(() => {
      setAccessToken('')
      setRefreshToken('')
      setCurrentUser(null)
      setAuthError(null)
      setAuthReady(true)
      setAuthLoading(false)
    })

    return unregister
  }, [])

  useEffect(() => {
    const storedAccessToken = getAccessToken()

    if (!storedAccessToken) {
      return
    }

    queueMicrotask(() => {
      loadMe(storedAccessToken).catch(() => {
        setAuthReady(true)
      })
    })
  }, [loadMe])

  const value = useMemo(() => ({
    accessToken,
    refreshToken,
    currentUser,
    authReady,
    authLoading,
    authError,
    clearAuth,
    loadMe,
    refreshMe: loadMe,
    reissueAccessToken,
    login,
    logout,
  }), [
    accessToken,
    refreshToken,
    currentUser,
    authReady,
    authLoading,
    authError,
    clearAuth,
    loadMe,
    reissueAccessToken,
    login,
    logout,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
