const express = require('express')
const router = express.Router()
const {
  getMyMessages,
  sendMyMessage,
  getConversations,
  getCustomerMessages,
  sendAdminMessage,
} = require('../controllers/chatController')
const { verifyToken, adminOnly, customerOnly } = require('../middleware/authMiddleware')

// Customer side
router.get('/my', verifyToken, customerOnly, getMyMessages)
router.post('/my', verifyToken, customerOnly, sendMyMessage)

// Admin side
router.get('/conversations', verifyToken, adminOnly, getConversations)
router.get('/conversations/:customerId', verifyToken, adminOnly, getCustomerMessages)
router.post('/conversations/:customerId', verifyToken, adminOnly, sendAdminMessage)

module.exports = router