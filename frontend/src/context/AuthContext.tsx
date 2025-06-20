import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  username: string | null
  token: string | null
  login: (username: string, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const storedToken = localStorage.getItem('token')
    if (storedUsername && storedToken) {
      setUsername(storedUsername)
      setToken(storedToken)
    }
  }, [])

  const login = (username: string, token: string) => {
    localStorage.setItem('username', username)
    localStorage.setItem('token', token)
    setUsername(username)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    setUsername(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
