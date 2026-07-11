import axios from 'axios'
import { buildApiUrl } from '../api/url'
import { clearTokens, getRefreshToken, saveTokens } from './tokenStorage'

export const AUTH_SESSION_ENDED_EVENT = 'neomango:auth-session-ended'
export const AUTH_LOGOUT_STARTED_EVENT = 'neomango:auth-logout-started'

let refreshPromise = null
let authFailureHandler = null
let logoutInProgress = false

function extractTokenData(response) {
  return response?.data?.data ?? response?.data ?? {}
}

export function registerAuthFailureHandler(handler) {
  authFailureHandler = handler

  return () => {
    if (authFailureHandler === handler) {
      authFailureHandler = null
    }
  }
}

export function isLogoutInProgress() {
  return logoutInProgress
}

export function signalLogoutStarted() {
  logoutInProgress = true
  window.dispatchEvent(new Event(AUTH_LOGOUT_STARTED_EVENT))
}

export function signalLogoutFinished() {
  logoutInProgress = false
}

export function endAuthenticatedSession(reason = 'auth-failure') {
  clearTokens()
  authFailureHandler?.(reason)
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_ENDED_EVENT, {
    detail: { reason },
  }))
}

export async function refreshTokensOnce() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        endAuthenticatedSession('missing-refresh-token')
        throw new Error('refreshToken is not available.')
      }

      const response = await axios.post(buildApiUrl('/api/auth/reissue'), {
        refreshToken,
      })
      const tokenData = extractTokenData(response)

      saveTokens({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenType: tokenData.tokenType ?? 'Bearer',
        accessTokenExpiresIn: tokenData.accessTokenExpiresIn,
      })

      return tokenData.accessToken
    })()
      .catch((error) => {
        endAuthenticatedSession('reissue-failed')
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}
