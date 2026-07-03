import { useCallback, useEffect, useMemo, useState } from 'react'
import { login as requestLogin, reissue as requestReissue } from '../api/authApi'
import { getCurrentUser } from '../api/userApi'
import {
  ACCESS_TOKEN_STORAGE_KEY,
  AuthContext,
  REFRESH_TOKEN_STORAGE_KEY,
} from './AuthContextValue'

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

function readStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? ''
}

function readStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? ''
}

function removeStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

function removeStoredRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

function storeAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

function storeRefreshToken(refreshToken) {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(readStoredAccessToken)
  const [refreshToken, setRefreshToken] = useState(readStoredRefreshToken)
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(() => !readStoredAccessToken())
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const clearAuth = useCallback(function clearAuth() {
    removeStoredAccessToken()
    removeStoredRefreshToken()
    setAccessToken('')
    setRefreshToken('')
    setCurrentUser(null)
    setAuthError(null)
    setAuthReady(true)
    setAuthLoading(false)
  }, [])

  const loadMe = useCallback(async function loadMe(token = readStoredAccessToken()) {
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

      setAccessToken(token)
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

      storeAccessToken(nextAccessToken)
      storeRefreshToken(nextRefreshToken)
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
      removeStoredAccessToken()
      removeStoredRefreshToken()
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

  const logout = useCallback(function logout() {
    clearAuth()
  }, [clearAuth])

  const reissueAccessToken = useCallback(async function reissueAccessToken() {
    const currentRefreshToken = readStoredRefreshToken()

    if (!currentRefreshToken) {
      clearAuth()
      throw new Error('refreshToken is not available.')
    }

    try {
      const tokenResponse = await requestReissue({
        refreshToken: currentRefreshToken,
      })
      const nextAccessToken = tokenResponse?.accessToken
      const nextRefreshToken = tokenResponse?.refreshToken ?? currentRefreshToken

      if (!nextAccessToken) {
        throw new Error('Reissue response does not include accessToken.')
      }

      storeAccessToken(nextAccessToken)
      storeRefreshToken(nextRefreshToken)
      setAccessToken(nextAccessToken)
      setRefreshToken(nextRefreshToken)
      setAuthReady(true)

      return nextAccessToken
    } catch (error) {
      clearAuth()
      throw error
    }
  }, [clearAuth])

  useEffect(() => {
    const storedAccessToken = readStoredAccessToken()

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
