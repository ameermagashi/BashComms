import { createContext, useContext, useState } from 'react'

// A "box" that any page can open to see who is logged in
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // When the page loads, check if someone was already logged in
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Called after a successful login or register
  const saveLogin = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // Called when the user clicks Logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// A shortcut so pages can write: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}