import { useEffect, useState } from 'react'
import { api } from './api/client'
import Login from './components/Login'
import EmployeeForm from './components/EmployeeForm'
import EmployeeTable from './components/EmployeeTable'
import EmployeeProfile from './components/EmployeeProfile'

export default function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function boot() {
      if (!api.getToken()) { setBooting(false); return }
      try {
        const me = await api.me()
        setUser(me)
      } catch {
        api.clearToken()
      } finally {
        setBooting(false)
      }
    }
    boot()
  }, [])

  useEffect(() => {
    if (!user) return
    api.getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err?.message || 'Could not load employees'))
  }, [user])

  async function handleAdd(payload) {
    const created = await api.createEmployee(payload)
    setEmployees((list) => [...list, created])
  }

  async function handleDelete(id) {
    const prev = employees
    setEmployees((list) => list.filter((e) => e.id !== id))
    try {
      await api.deleteEmployee(id)
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      setEmployees(prev)
      setError(err?.message || 'Delete failed')
    }
  }

  async function handleLogout() {
    try { await api.logout() } catch { /* ignore */ }
    api.clearToken()
    setUser(null)
    setEmployees([])
  }

  if (booting) return <div className="center muted">Loading…</div>
  if (!user) return <Login onLoggedIn={setUser} />

  return (
    <div className="app">
      <header className="topbar">
        <h1>Employee Management</h1>
        <div className="topbar-right">
          <span className="muted">{user.name || user.email}</span>
          <button className="btn ghost" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {error && <p className="alert container">{error}</p>}

      <main className="layout">
        <EmployeeForm onAdd={handleAdd} />
        <EmployeeTable employees={employees} onView={setSelected} onDelete={handleDelete} />
      </main>

      {selected && <EmployeeProfile employee={selected} onBack={() => setSelected(null)} />}
    </div>
  )
}
