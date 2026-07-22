export default function EmployeeProfile({ employee, onBack }) {
  if (!employee) return null

  return (
    <div className="modal-overlay" onClick={onBack}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-head">
          <div className="avatar">{employee.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{employee.name}</h2>
            <p className="muted">{employee.role}</p>
          </div>
        </div>

        <dl className="profile-details">
          <div><dt>Email</dt><dd>{employee.email}</dd></div>
          <div><dt>Department</dt><dd>{employee.department}</dd></div>
          <div><dt>Role</dt><dd>{employee.role}</dd></div>
          <div><dt>ID</dt><dd>{employee.id}</dd></div>
        </dl>

        <button className="btn primary" onClick={onBack}>Back to table</button>
      </div>
    </div>
  )
}
