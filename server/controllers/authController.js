const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')

// Makes the login "badge" that the client keeps
function makeToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// REGISTER: create a new customer
exports.register = async (req, res) => {
  try {
    const { name, password } = req.body
    const email = (req.body.email || '').trim().toLowerCase()

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    // Is this email already used?
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' })
    }

    // Scramble the password before saving it
    const hashed = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email, hashed]
    )

    const user = { id: result.insertId, name: name.trim(), email, role: 'customer' }
    res.status(201).json({ token: makeToken(user), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// LOGIN: check email and password
exports.login = async (req, res) => {
  try {
    const { password } = req.body
    const email = (req.body.email || '').trim().toLowerCase()

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password.' })
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Wrong email or password.' })
    }

    const found = rows[0]
    const passwordOk = await bcrypt.compare(password, found.password)
    if (!passwordOk) {
      return res.status(400).json({ message: 'Wrong email or password.' })
    }

    // Never send the password back to the client
    const user = { id: found.id, name: found.name, email: found.email, role: found.role }
    res.json({ token: makeToken(user), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}