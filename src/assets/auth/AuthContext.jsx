import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const USER_KEY = 'sm_user'
const ACCOUNTS_KEY = 'sm_accounts'

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(USER_KEY, null))

  const startSession = (u) => {
    setUser(u)
    write(USER_KEY, u)
  }

  const register = ({ name, email }) => {
    const clean = { name: name.trim(), email: email.trim().toLowerCase() }
    const accounts = read(ACCOUNTS_KEY, {})
    accounts[clean.email] = clean
    write(ACCOUNTS_KEY, accounts)
    startSession(clean)
    return clean
  }

  const login = ({ email }) => {
    const key = email.trim().toLowerCase()
    const saved = read(ACCOUNTS_KEY, {})[key]
    const u = saved || { name: key.split('@')[0], email: key }
    startSession(u)
    return u
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(USER_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}