import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 4000
const SECRET = 'change-this-secret-in-production'

app.use(cors())
app.use(express.json())

// ---- Database (SQLite file, created automatically) ----
const db = new Database('data.db')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    role TEXT NOT NULL
  );
`)

// ---- Seed a default admin + sample employees on first run ----
function seed() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c
  if (count === 0) {
    const hash = bcrypt.hashSync('password', 10)
    db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run('Admin', 'admin@example.com', hash)

    const insert = db.prepare(
      'INSERT INTO employees (name, email, department, role) VALUES (?, ?, ?, ?)'
    )
    insert.run('Sara Ahmed', 'sara@company.com', 'Engineering', 'Backend Developer')
    insert.run('Omar Ali', 'omar@company.com', 'Design', 'UI/UX Designer')
    insert.run('Lana Karim', 'lana@company.com', 'Marketing', 'Content Lead')
    console.log('Seeded default admin (admin@example.com / password) + sample employees')
  }
}
seed()

// ---- Auth middleware ----
function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ---- Auth routes ----
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(422).json({ message: 'Name, email and password are required' })
  if (password.length < 6)
    return res.status(422).json({ message: 'Password must be at least 6 characters' })

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return res.status(422).json({ message: 'Email already registered' })

  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hash)
  const user = { id: info.lastInsertRowid, name, email }
  const token = jwt.sign(user, SECRET, { expiresIn: '7d' })
  res.status(201).json({ user, token })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!row || !bcrypt.compareSync(password, row.password))
    return res.status(422).json({ message: 'The provided credentials are incorrect' })

  const user = { id: row.id, name: row.name, email: row.email }
  const token = jwt.sign(user, SECRET, { expiresIn: '7d' })
  res.json({ user, token })
})

app.get('/api/me', auth, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email })
})

app.post('/api/logout', auth, (req, res) => {
  // Token is stateless; the client just discards it.
  res.json({ message: 'Logged out' })
})

// ---- Employee routes (protected) ----
app.get('/api/employees', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM employees ORDER BY id').all())
})

app.get('/api/employees/:id', auth, (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id)
  if (!emp) return res.status(404).json({ message: 'Employee not found' })
  res.json(emp)
})

app.post('/api/employees', auth, (req, res) => {
  const { name, email, department, role } = req.body
  const errors = {}
  if (!name?.trim()) errors.name = ['Name is required']
  if (!email?.trim()) errors.email = ['Email is required']
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Enter a valid email']
  if (!department?.trim()) errors.department = ['Department is required']
  if (!role?.trim()) errors.role = ['Role is required']
  if (Object.keys(errors).length)
    return res.status(422).json({ message: 'Validation failed', errors })

  const dup = db.prepare('SELECT id FROM employees WHERE email = ?').get(email)
  if (dup) return res.status(422).json({ message: 'Validation failed', errors: { email: ['Email already exists'] } })

  const info = db.prepare(
    'INSERT INTO employees (name, email, department, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, department, role)
  res.status(201).json(db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid))
})

app.put('/api/employees/:id', auth, (req, res) => {
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id)
  if (!emp) return res.status(404).json({ message: 'Employee not found' })

  const { name, email, department, role } = { ...emp, ...req.body }
  db.prepare('UPDATE employees SET name=?, email=?, department=?, role=? WHERE id=?')
    .run(name, email, department, role, req.params.id)
  res.json(db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id))
})

app.delete('/api/employees/:id', auth, (req, res) => {
  const info = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ message: 'Employee not found' })
  res.json({ message: 'Employee deleted' })
})

// ---- User management routes (bonus, protected) ----
app.get('/api/users', auth, (req, res) => {
  res.json(db.prepare('SELECT id, name, email FROM users ORDER BY id').all())
})

app.post('/api/users', auth, (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(422).json({ message: 'Name, email and password are required' })
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return res.status(422).json({ message: 'Email already registered' })

  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hash)
  res.status(201).json({ id: info.lastInsertRowid, name, email })
})

app.put('/api/users/:id', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const name = req.body.name ?? user.name
  const email = req.body.email ?? user.email
  const password = req.body.password ? bcrypt.hashSync(req.body.password, 10) : user.password
  db.prepare('UPDATE users SET name=?, email=?, password=? WHERE id=?')
    .run(name, email, password, req.params.id)
  res.json({ id: user.id, name, email })
})

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
