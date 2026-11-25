import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>
          Order what you need, <span>fast and easy</span>
        </h1>
        <p>
          Browse our products, place your order, pay, and chat with us
          directly if you have any questions.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn">Get started</Link>
          <Link to="/login" className="btn btn-outline">I have an account</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="icon">🛍️</div>
          <h3>See products</h3>
          <p>Look at everything that is available, with clear descriptions.</p>
        </div>
        <div className="feature-card">
          <div className="icon">📦</div>
          <h3>Place orders</h3>
          <p>Choose a product, set how urgent it is, and send your order.</p>
        </div>
        <div className="feature-card">
          <div className="icon">💬</div>
          <h3>Chat with us</h3>
          <p>Have a question? Message the shop owner straight from the app.</p>
        </div>
      </section>
    </main>
  )
}

export default Home