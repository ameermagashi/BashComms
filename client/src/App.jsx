import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Shop from './pages/Shop'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import AdminProducts from './pages/AdminProducts'
import AdminChat from './pages/AdminChat'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer pages */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute role="customer">
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute role="customer">
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Admin pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute role="admin">
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute role="admin">
              <AdminChat />
            </ProtectedRoute>
          }
        />

        {/* My Orders comes in the next step */}
        <Route
          path="*"
          element={<p className="container" style={{ padding: '40px 20px' }}>This page is coming soon.</p>}
        />
      </Routes>
    </>
  )
}

export default App