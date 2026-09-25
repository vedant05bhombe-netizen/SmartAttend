import React, { createContext, useContext, useState, useCallback } from 'react'
import * as api from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sa_user')
    return raw ? JSON.parse(raw) : null
  })

  const persist = (data) => {
    localStorage.setItem('sa_token', data.token)
    localStorage.setItem('sa_user', JSON.stringify(data))
    setUser(data)
  }

  const login = useCallback(async (payload) => {
    const data = await api.login(payload)
    persist(data)
    return data
  }, [])

  const signupOrg = useCallback(async (payload) => {
    const data = await api.orgSignup(payload)
    persist(data)
    return data
  }, [])

  const signupStudent = useCallback(async (payload) => {
    const data = await api.studentSignup(payload)
    persist(data)
    return data
  }, [])

  const joinAdmin = useCallback(async (payload) => {
    const data = await api.adminJoin(payload)
    persist(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, signupOrg, signupStudent, joinAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
