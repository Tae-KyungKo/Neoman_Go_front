import { createContext } from 'react'

export {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from './tokenStorage'

export const AuthContext = createContext(null)
