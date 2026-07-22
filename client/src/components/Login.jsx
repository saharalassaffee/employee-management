import { useState } from 'react'
import { api } from '../api/client'

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit() {
    setError('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.login(form.email, form.password)
        : await api.register(form)
      api.setToken(res.token)
      onLoggedIn(res.user)
    } catch (err) {
      setError(err?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <p className="muted">Employee Management</p>
        {error && <p className="alert">{error}</p>}

        {mode === 'register' && (
          <div className="field">
            <label htmlFor="rname">Name</label>
            <input id="rname" name="name" value={form.name} onChange={handleChange} />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
        </div>

        <button className="btn primary" onClick={submit} disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>

        <p className="switch">
          {mode === 'login' ? "No account?" : 'Already registered?'}{' '}
          <button className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
