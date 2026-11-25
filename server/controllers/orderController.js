const db = require('../config/db')

const STATUSES = ['pending', 'processing', 'completed', 'cancelled']

// CUSTOMER: place a new order
exports.createOrder = async (req, res) => {
  try {
    const { product_id, description, priority } = req.body
    const quantity = parseInt(req.body.quantity, 10) || 1

    if (!product_id || quantity < 1) {
      return res.status(400).json({ message: 'Please choose a product and a quantity.' })
    }

    const allowed = ['low', 'medium', 'high']
    const chosenPriority = allowed.includes(priority) ? priority : 'medium'

    // Find the product
    const [rows] = await db.query(
      'SELECT id, price FROM products WHERE id = ? AND is_available = 1',
      [product_id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'This product is not available.' })
    }
    const product = rows[0]

    // Take the items from stock (only works if enough are left)
    const [stockResult] = await db.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, product.id, quantity]
    )
    if (stockResult.affectedRows === 0) {
      return res.status(400).json({ message: 'Sorry, there is not enough stock for that quantity.' })
    }

    const total = product.price * quantity

    const [result] = await db.query(
      `INSERT INTO orders
        (user_id, product_id, quantity, description, priority, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, product.id, quantity, (description || '').trim(), chosenPriority, total]
    )

    res.status(201).json({ message: 'Your order has been placed.', orderId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// CUSTOMER: see my own orders
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.quantity, o.description, o.priority, o.total_price,
              o.payment_status, o.status, o.created_at,
              p.name AS product_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    )
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: see all orders, with search and filters
// Example: /api/orders?search=amir&date=2026-11-23&priority=high&status=pending
exports.getAllOrders = async (req, res) => {
  try {
    const { search, date, priority, status } = req.query

    let sql = `
      SELECT o.id, o.quantity, o.description, o.priority, o.total_price,
             o.payment_status, o.status, o.created_at,
             u.name AS customer_name, u.email AS customer_email,
             p.name AS product_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN products p ON o.product_id = p.id
      WHERE 1 = 1`
    const params = []

    // Search by customer name or product name
    if (search) {
      sql += ' AND (u.name LIKE ? OR p.name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // Only orders made on one day
    if (date) {
      sql += ' AND DATE(o.created_at) = ?'
      params.push(date)
    }

    // Only one priority
    if (priority) {
      sql += ' AND o.priority = ?'
      params.push(priority)
    }

    // Only one status
    if (status) {
      sql += ' AND o.status = ?'
      params.push(status)
    }

    sql += ' ORDER BY o.created_at DESC'

    const [orders] = await db.query(sql, params)
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: how many orders came in today (cancelled orders do not count)
exports.getTodayStats = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total_price), 0) AS total_amount
       FROM orders
       WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled'`
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: change the status of an order
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Unknown status.' })
  }

  // A transaction means: either every step works, or nothing changes
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.query(
      'SELECT product_id, quantity, status FROM orders WHERE id = ? FOR UPDATE',
      [req.params.id]
    )
    if (rows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Order not found.' })
    }
    const order = rows[0]

    if (order.status !== status) {
      // Cancelling puts the items back on the shelf
      if (status === 'cancelled') {
        await connection.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [order.quantity, order.product_id]
        )
      }

      // Bringing a cancelled order back takes the items from the shelf again
      if (order.status === 'cancelled') {
        const [result] = await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [order.quantity, order.product_id, order.quantity]
        )
        if (result.affectedRows === 0) {
          await connection.rollback()
          return res.status(400).json({ message: 'Not enough stock to bring this order back.' })
        }
      }

      await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
    }

    await connection.commit()
    res.json({ message: 'Order updated.' })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  } finally {
    connection.release()
  }
}

// ADMIN: delete an order (only after it has been cancelled)
exports.deleteOrder = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT status FROM orders WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' })
    }
    if (rows[0].status !== 'cancelled') {
      return res.status(400).json({ message: 'Cancel the order first, then you can delete it.' })
    }

    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id])
    res.json({ message: 'Order deleted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}