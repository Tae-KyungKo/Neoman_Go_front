import { useContext } from 'react'
import { AuthContext } from './AuthContextValue'

export function useAuth() {
  const auth = useContext(AuthContext)

  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return auth
}
