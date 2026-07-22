import { useState } from 'react'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance']
const EMPTY = { name: '', email: '', department: '', role: '' }

export default function EmployeeForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((err) => ({ ...err, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.department) next.department = 'Pick a department'
    if (!form.role.trim()) next.role = 'Role is required'
    return next
  }

  async function handleSubmit() {
    const found = validate()
    if (Object.keys(found).length) { setErrors(found); return }
    setSubmitting(true)
    try {
      await onAdd(form)
      setForm(EMPTY)
      setErrors({})
    } catch (err) {
      if (err?.errors) {
        const mapped = {}
        for (const key in err.errors) mapped[key] = err.errors[key][0]
        setErrors(mapped)
      } else {
        setErrors({ form: err?.message || 'Could not add employee' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h2>Add employee</h2>
      {errors.form && <p className="alert">{errors.form}</p>}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={form.name}
          onChange={handleChange} placeholder="Jane Doe" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email}
          onChange={handleChange} placeholder="jane@company.com" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="department">Department</label>
        <select id="department" name="department" value={form.department} onChange={handleChange}>
          <option value="">Select department…</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.department && <span className="error">{errors.department}</span>}
      </div>

      <div className="field">
        <label htmlFor="role">Role</label>
        <input id="role" name="role" type="text" value={form.role}
          onChange={handleChange} placeholder="Frontend Developer" />
        {errors.role && <span className="error">{errors.role}</span>}
      </div>

      <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Adding…' : 'Add employee'}
      </button>
    </div>
  )
}
