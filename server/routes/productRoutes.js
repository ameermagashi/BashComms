const express = require('express')
const router = express.Router()
const {
  getProducts,
  getAllProducts,
  createProduct,
  toggleAvailability,
  deleteProduct,
} = require('../controllers/productController')
const { verifyToken, adminOnly } = require('../middleware/authMiddleware')
const { uploadProductFiles } = require('../middleware/upload')

router.get('/', verifyToken, getProducts)                        // customers
router.get('/manage', verifyToken, adminOnly, getAllProducts)    // admin: all products
router.post('/', verifyToken, adminOnly, uploadProductFiles, createProduct)
router.patch('/:id/availability', verifyToken, adminOnly, toggleAvailability)
router.delete('/:id', verifyToken, adminOnly, deleteProduct)

module.exports = router