import { useCallback, useEffect, useMemo, useState } from 'react'
import { login as requestLogin } from '../api/authApi'
import { getCurrentUser } from '../api/userApi'
import { ACCESS_TOKEN_STORAGE_KEY, AuthContext } from './AuthContextValue'

function extractAccessToken(response) {
  return (
    response?.data?.data?.accessToken ??
    response?.data?.accessToken ??
    response?.data?.result?.accessToken ??
    null
  )
}

function normalizeUser(me, accessToken, email = '') {
  if (!me) {
    return {
      isLoggedIn: Boolean(accessToken),
      accessToken,
      email,
    }
  }

  return {
    ...me,
    isLoggedIn: true,
    accessToken,
    email: me.email || email,
  }
}

function isAuthFailure(error) {
  const status = error?.response?.status
  return status === 401 || status === 403
}

function readStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? ''
}

function removeStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

function storeAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(readStoredAccessToken)
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(() => !readStoredAccessToken())
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const clearAuth = useCallback(function clearAuth() {
    removeStoredAccessToken()
    setAccessToken('')
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

      if (!nextAccessToken) {
        throw new Error('Login response does not include accessToken.')
      }

      storeAccessToken(nextAccessToken)
      setAccessToken(nextAccessToken)

      try {
        return await loadMe(nextAccessToken)
      } catch (error) {
        if (isAuthFailure(error)) {
          throw error
        }

        const fallbackUser = normalizeUser(null, nextAccessToken, credentials.email)
        setCurrentUser(fallbackUser)
        setAuthReady(true)
        return fallbackUser
      }
    } catch (error) {
      removeStoredAccessToken()
      setAccessToken('')
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
    currentUser,
    authReady,
    authLoading,
    authError,
    clearAuth,
    loadMe,
    refreshMe: loadMe,
    login,
    logout,
  }), [
    accessToken,
    currentUser,
    authReady,
    authLoading,
    authError,
    clearAuth,
    loadMe,
    login,
    logout,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
