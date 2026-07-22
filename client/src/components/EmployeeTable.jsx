export default function EmployeeTable({ employees, onView, onDelete }) {
  if (!employees.length) {
    return (
      <div className="card">
        <h2>Employees</h2>
        <p className="empty">No employees yet. Add one using the form.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Employees</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.role}</td>
                <td className="actions">
                  <button className="btn ghost" onClick={() => onView(emp)}>View</button>
                  <button className="btn danger" onClick={() => onDelete(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
