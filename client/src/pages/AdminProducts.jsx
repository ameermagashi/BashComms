import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminTabs from '../components/AdminTabs'
import FileDropzone from '../components/FileDropzone'
import { formatPrice, fileUrl } from '../utils/format'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0) // changing this empties the form

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/manage')
      setProducts(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the products.')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    // FormData is how a form sends files
    const data = new FormData()
    data.append('name', name)
    data.append('price', price)
    data.append('stock', stock)
    data.append('description', description)
    if (image) data.append('image', image)
    if (video) data.append('video', video)

    try {
      const res = await api.post('/products', data)
      setSuccess(res.data.message)
      setName('')
      setPrice('')
      setStock('')
      setDescription('')
      setImage(null)
      setVideo(null)
      setFormKey((k) => k + 1)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add the product.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await api.patch(`/products/${id}/availability`)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the product.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setError('')
    setSuccess('')
    try {
      await api.delete(`/products/${id}`)
      setSuccess('Product deleted.')
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the product.')
    }
  }

  return (
    <main className="container page">
      <h1 className="page-title">Admin dashboard</h1>
      <p className="page-sub">Add products with a picture and a video.</p>

      <AdminTabs />

      {success && <div className="success-box">{success}</div>}
      {error && <div className="error-box">{error}</div>}

      {/* Add product form */}
      <form className="product-form" key={formKey} onSubmit={handleSubmit}>
        <h2>Add a new product</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="p-name">Product name</label>
            <input
              id="p-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="p-price">Price (₦)</label>
            <input
              id="p-price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="p-stock">Stock</label>
            <input
              id="p-stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="p-desc">Description</label>
          <textarea
            id="p-desc"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <FileDropzone
            label="Product picture"
            hint="JPG, PNG, WEBP or GIF · up to 10 MB"
            accept="image/jpeg,image/png,image/webp,image/gif"
            kind="image"
            maxMB={10}
            file={image}
            onChange={setImage}
          />
          <FileDropzone
            label="Product video"
            hint="MP4, WEBM or MOV · up to 50 MB"
            accept="video/mp4,video/webm,video/quicktime"
            kind="video"
            maxMB={50}
            file={video}
            onChange={setVideo}
          />
        </div>

        <button className="btn" disabled={saving}>
          {saving ? 'Uploading...' : 'Add product'}
        </button>
      </form>

      {/* Product list */}
      <h2 className="section-title">Your products</h2>

      {products.length === 0 && <p className="empty-note">No products yet.</p>}

      <div className="admin-product-list">
        {products.map((product) => (
          <div className="admin-product-row" key={product.id}>
            {product.image_url ? (
              <img
                className="thumb"
                src={fileUrl(product.image_url)}
                alt={product.name}
              />
            ) : (
              <div className="thumb thumb-empty">No picture</div>
            )}

            <div className="admin-product-info">
              <strong>{product.name}</strong>
              <div className="small-muted">
                {formatPrice(product.price)} · {product.stock} in stock
                {product.video_url ? ' · has video' : ''}
              </div>
              <span className={'badge ' + (product.is_available ? 'badge-paid' : 'badge-unpaid')}>
                {product.is_available ? 'Visible' : 'Hidden'}
              </span>
            </div>

            <div className="admin-product-buttons">
              <button
                className="btn btn-outline btn-small"
                onClick={() => handleToggle(product.id)}
              >
                {product.is_available ? 'Hide' : 'Show'}
              </button>
              <button
                className="btn btn-small btn-danger"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default AdminProducts