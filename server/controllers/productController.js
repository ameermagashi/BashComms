const fs = require('fs')
const path = require('path')
const db = require('../config/db')

// Delete a file from the shelf (url looks like /uploads/123.jpg)
function removeFile(url) {
  if (!url) return
  const filePath = path.join(__dirname, '..', url.replace(/^\/+/, ''))
  fs.unlink(filePath, () => {})
}

// CUSTOMERS: only products that are for sale
exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT id, name, description, price, stock, image_url, video_url
       FROM products
       WHERE is_available = 1
       ORDER BY created_at DESC`
    )
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: every product, including hidden ones
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT id, name, description, price, stock, image_url, video_url, is_available
       FROM products
       ORDER BY created_at DESC`
    )
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: add a new product with a picture and a video
exports.createProduct = async (req, res) => {
  const image = req.files?.image?.[0]
  const video = req.files?.video?.[0]

  // If the form is wrong, remove the files that were just uploaded
  const cleanUp = () => {
    if (image) removeFile('/uploads/' + image.filename)
    if (video) removeFile('/uploads/' + video.filename)
  }

  try {
    const { name, description } = req.body
    const price = Number(req.body.price)
    const stock = parseInt(req.body.stock, 10) || 0

    if (!name || !name.trim() || !(price > 0)) {
      cleanUp()
      return res.status(400).json({ message: 'Please enter a product name and a price above 0.' })
    }

    const [result] = await db.query(
      `INSERT INTO products (name, description, price, stock, image_url, video_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        (description || '').trim(),
        price,
        stock,
        image ? '/uploads/' + image.filename : null,
        video ? '/uploads/' + video.filename : null,
      ]
    )

    res.status(201).json({ message: 'Product added.', id: result.insertId })
  } catch (err) {
    cleanUp()
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: hide a product from customers, or show it again
exports.toggleAvailability = async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE products SET is_available = NOT is_available WHERE id = ?',
      [req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    res.json({ message: 'Product updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}

// ADMIN: delete a product (and its picture and video)
exports.deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT image_url, video_url FROM products WHERE id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    try {
      await db.query('DELETE FROM products WHERE id = ?', [req.params.id])
    } catch (err) {
      // Orders point to this product, so the database refuses
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          message: 'This product already has orders, so it cannot be deleted. Hide it instead.',
        })
      }
      throw err
    }

    removeFile(rows[0].image_url)
    removeFile(rows[0].video_url)
    res.json({ message: 'Product deleted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on the server.' })
  }
}