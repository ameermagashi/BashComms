import { useEffect, useState } from 'react'
import api from '../api/axios'
import OrderModal from '../components/OrderModal'
import { formatPrice, fileUrl } from '../utils/format'
import { Link } from 'react-router-dom'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null) // the product being ordered
  const [success, setSuccess] = useState('')

  const loadProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the products.')
    } finally {
      setLoading(false)
    }
  }

  // Load the products once, when the page opens
  useEffect(() => {
    loadProducts()
  }, [])

  const handleSuccess = (message) => {
    setSelected(null)
    setSuccess(message)
    loadProducts() // refresh so the stock numbers update
  }

  return (
    <main className="container page">
            <section className="shop-hero">
        <div>
          <span className="shop-hero-tag">Our products</span>
          <h1>Find what you need</h1>
          <p>
            Choose a product, tell us how urgent it is, and place your order in
            a minute.
          </p>
        </div>

        <div className="shop-hero-side">
          <div className="shop-hero-count">
            <strong>{products.length}</strong>
            <span>products available</span>
          </div>
          <Link to="/chat" className="btn btn-light">
            Chat with us
          </Link>
        </div>
      </section>

      {success && <div className="success-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}
      {loading && <p>Loading products...</p>}

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image_url && (
              <img
                className="product-img"
                src={fileUrl(product.image_url)}
                alt={product.name}
              />
            )}

            {product.video_url && (
              <video
                className="product-video"
                src={fileUrl(product.video_url)}
                controls
                preload="metadata"
              />
            )}

            <h3>{product.name}</h3>
            <p className="product-desc">{product.description}</p>

            <div className="product-meta">
              <span className="price">{formatPrice(product.price)}</span>
              <span className={product.stock > 0 ? 'stock' : 'stock out'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <button
              className="btn btn-full"
              disabled={product.stock === 0}
              onClick={() => {
                setSuccess('')
                setSelected(product)
              }}
            >
              Order now
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <OrderModal
          product={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </main>
  )
}

export default Shop