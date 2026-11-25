const db = require('../config/db')

// The part of the query that gets a message together with who wrote it
const MESSAGE_SELECT = `
  SELECT m.id, m.customer_id, m.sender_id, m.body, m.created_at,
         u.name AS sender_name, u.role AS sender_role
  FROM messages m
  JOIN users u ON m.sender_id = u.id`

// All messages of one customer's conversation, oldest first
async function listMessages(customerId) {
  const [rows] = await db.query(
    MESSAGE_SELECT + ' WHERE m.customer_id = ? ORDER BY m.id ASC',
    [customerId]
  )
  return rows
}

// Save a message and give it back
async function saveMessage(customerId, senderId, body) {
  const [result] = await db.query(
    'INSERT INTO messages (customer_id, sender_id, body) VALUES (?, ?, ?)',
    [customerId, senderId, body]
  )
  const [rows] = await db.query(MESSAGE_SELECT + ' WHERE m.id = ?', [result.insertId])
  return rows[0]
}

// Check the text of a message
function cleanBody(raw) {
  const body = (raw || '').toString().trim()
  if (!body) return { error: 'Please type a message.' }
  if (body.length > 1000) return { error: 'A message can have up to 1000 characters.' }
  return { body }
}

// CUSTOMER: read my conversation
exports.getMyMessages = async (req, res) => {
  try {
    res.json(await listMessages(req.user.id))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// CUSTOMER: send a message to the shop
exports.sendMyMessage = async (req, res) => {
  try {
    const { body, error } = cleanBody(req.body.body)
    if (error) return res.status(400).json({ message: error })

    const message = await saveMessage(req.user.id, req.user.id, body)
    res.status(201).json(message)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: the list of customers who have written, newest conversation first
exports.getConversations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id AS customer_id, u.name, u.email,
              m.body AS last_message, m.created_at AS last_time
       FROM users u
       JOIN messages m ON m.id = (
         SELECT MAX(id) FROM messages WHERE customer_id = u.id
       )
       WHERE u.role = 'customer'
       ORDER BY m.id DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: read one customer's conversation
exports.getCustomerMessages = async (req, res) => {
  try {
    res.json(await listMessages(req.params.customerId))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: reply to a customer
exports.sendAdminMessage = async (req, res) => {
  try {
    const { body, error } = cleanBody(req.body.body)
    if (error) return res.status(400).json({ message: error })

    const [customers] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'customer'",
      [req.params.customerId]
    )
    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' })
    }

    const message = await saveMessage(customers[0].id, req.user.id, body)
    res.status(201).json(message)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}