import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { saveLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault() // stop the page from reloading
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })
      saveLogin(res.data.token, res.data.user)

      // Admins go to the admin area, customers go to the shop
      if (res.data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/shop')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="auth-sub">Log in to see products and your orders.</p>

        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}

export default Login