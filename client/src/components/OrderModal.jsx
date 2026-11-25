import { useState } from 'react'
import api from '../api/axios'
import { formatPrice } from '../utils/format'

function OrderModal({ product, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const total = product.price * quantity

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/orders', {
        product_id: product.id,
        quantity,
        description,
        priority,
      })
      onSuccess(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation: clicking inside the box should not close it */}
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Order: {product.name}</h2>
        <p className="auth-sub">{formatPrice(product.price)} each</p>

        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low (no rush)</option>
            <option value="medium">Medium</option>
            <option value="high">High (urgent)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description / note</label>
          <textarea
            id="description"
            rows="3"
            placeholder="Colour, delivery address, anything we should know"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="order-total">
          Total: <strong>{formatPrice(total)}</strong>
        </div>

        <div className="modal-buttons">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" disabled={loading}>
            {loading ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrderModal