import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminTabs from '../components/AdminTabs'
import { formatPrice, formatDate } from '../utils/format'

const STATUSES = ['pending', 'processing', 'completed', 'cancelled']

function Admin() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ total_orders: 0, total_amount: 0 })
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0) // adding 1 makes the page reload its data

  const reload = () => setRefresh((n) => n + 1)

  // Today's numbers for the dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/orders/stats/today')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    loadStats()
  }, [refresh])

  // The orders list reloads when a filter changes or after an update
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.get('/orders', {
          params: { search, date, priority, status },
        })
        setOrders(res.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load the orders.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [search, date, priority, status, refresh])

  const clearFilters = () => {
    setSearch('')
    setDate('')
    setPriority('')
    setStatus('')
  }

  // Change the status of one order
  const handleStatusChange = async (id, newStatus) => {
    setError('')
    setMessage('')
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus })
      reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the order.')
    }
  }

  // Delete a cancelled order
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order for good? This cannot be undone.')) return
    setError('')
    setMessage('')
    try {
      await api.delete(`/orders/${id}`)
      setMessage('Order deleted.')
      reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the order.')
    }
  }

  return (
    <main className="container page">
      <h1 className="page-title">Admin dashboard</h1>
      <p className="page-sub">See every order your customers have made.</p>

      <AdminTabs />

      {/* Today's numbers */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Orders today</span>
          <span className="stat-number">{stats.total_orders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sales today</span>
          <span className="stat-number">{formatPrice(stats.total_amount)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Orders shown below</span>
          <span className="stat-number">{orders.length}</span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search customer or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button className="btn btn-outline btn-small" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}
      {loading && <p>Loading orders...</p>}

      {!loading && orders.length === 0 && !error && (
        <p className="empty-note">No orders found.</p>
      )}

      {orders.length > 0 && (
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Note</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Ordered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={order.status === 'cancelled' ? 'row-cancelled' : ''}>
                  <td>{order.id}</td>
                  <td>
                    {order.customer_name}
                    <div className="small-muted">{order.customer_email}</div>
                  </td>
                  <td>{order.product_name}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={'badge badge-' + order.priority}>{order.priority}</span>
                  </td>
                  <td className="note-cell">{order.description || '-'}</td>
                  <td>{formatPrice(order.total_price)}</td>
                  <td>
                    <span className={'badge badge-' + order.payment_status}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <select
                      className={'status-select status-' + order.status}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    {order.status === 'cancelled' && (
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(order.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default Admin