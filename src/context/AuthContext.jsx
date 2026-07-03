// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem('budgetcam_token')) {
        try { setUser((await authApi.getMe()).data.data) }
        catch { localStorage.removeItem('budgetcam_token') }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data: { data: { token, user: u } } } = await authApi.login({ email, password })
    localStorage.setItem('budgetcam_token', token)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (data) => {
    const { data: { data: { token, user: u } } } = await authApi.register(data)
    localStorage.setItem('budgetcam_token', token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('budgetcam_token')
    setUser(null)
  }, [])

  const updateUser = useCallback(async (prefs) => {
    const { data: { data: u } } = await authApi.updatePreferences(prefs)
    setUser(u)
    return u
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth hors AuthProvider')
  return ctx
}
