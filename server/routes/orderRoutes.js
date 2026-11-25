const express = require('express')
const router = express.Router()
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getTodayStats,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController')
const { verifyToken, adminOnly } = require('../middleware/authMiddleware')

router.post('/', verifyToken, createOrder)                          // customer orders
router.get('/my', verifyToken, getMyOrders)                         // customer's own orders
router.get('/', verifyToken, adminOnly, getAllOrders)               // admin: all orders
router.get('/stats/today', verifyToken, adminOnly, getTodayStats)   // admin: today's total
router.patch('/:id/status', verifyToken, adminOnly, updateOrderStatus) // admin: change status
router.delete('/:id', verifyToken, adminOnly, deleteOrder)          // admin: delete a cancelled order

module.exports = router