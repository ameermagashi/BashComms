const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const db = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const chatRoutes = require('./routes/chatRoutes')

const app = express()

app.use(cors())          // lets the React client talk to us
app.use(express.json())  // lets us read data sent as JSON

// Pictures and videos are served from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// A simple test page
app.get('/', (req, res) => {
  res.json({ message: 'Bash Comms server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/chat', chatRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Check that the database is reachable
  try {
    await db.query('SELECT 1')
    console.log('Database connected')
  } catch (err) {
    console.log('Database NOT connected:', err.message)
  }
})