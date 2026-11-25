import { NavLink } from 'react-router-dom'

function AdminTabs() {
  const tabClass = ({ isActive }) => (isActive ? 'tab active' : 'tab')

  return (
    <div className="admin-tabs">
      <NavLink to="/admin" end className={tabClass}>
        Orders
      </NavLink>
      <NavLink to="/admin/products" className={tabClass}>
        Products
      </NavLink>
      <NavLink to="/admin/chat" className={tabClass}>
        Messages
      </NavLink>
    </div>
  )
}

export default AdminTabs