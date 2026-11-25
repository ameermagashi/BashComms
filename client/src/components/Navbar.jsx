import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Bash<span>Comms</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin">Admin</Link>
              ) : (
                <>
                  <Link to="/shop">Shop</Link>
                  <Link to="/chat">Chat</Link>
                </>
              )}
              <span className="nav-user">Hi, {user.name}</span>
              <button className="btn btn-small btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-small">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar