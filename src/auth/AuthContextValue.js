import { createContext } from 'react'

export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'

export const AuthContext = createContext(null)
