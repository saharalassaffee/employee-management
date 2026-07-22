// Talks to the Express backend running on port 4000.
const BASE_URL = 'http://localhost:4000/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.message || 'Something went wrong',
      errors: data?.errors || null,
    }
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) =>
    request('/register', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),

  getEmployees: () => request('/employees'),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (payload) => request('/employees', { method: 'POST', body: payload }),
  updateEmployee: (id, payload) => request(`/employees/${id}`, { method: 'PUT', body: payload }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),

  setToken: (token) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
  getToken,
}
