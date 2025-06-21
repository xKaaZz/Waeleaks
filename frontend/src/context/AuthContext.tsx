// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  username: string | null
  token: string | null
  isAdmin: boolean
  login: (username: string, token: string, isAdmin: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const storedToken = localStorage.getItem('token')
    const storedIsAdmin = localStorage.getItem('isAdmin')
    if (storedUsername && storedToken) {
      setUsername(storedUsername)
      setToken(storedToken)
      setIsAdmin(storedIsAdmin === 'true')
    }
  }, [])

  const login = (username: string, token: string, isAdmin: boolean) => {
    localStorage.setItem('username', username)
    localStorage.setItem('token', token)
    localStorage.setItem('isAdmin', String(isAdmin))
    setUsername(username)
    setToken(token)
    setIsAdmin(isAdmin)
  }

  const logout = () => {
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    localStorage.removeItem('isAdmin')
    setUsername(null)
    setToken(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ username, token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
