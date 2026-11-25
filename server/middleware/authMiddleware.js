const jwt = require('jsonwebtoken')

// Is the person logged in?
exports.verifyToken = (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in first.' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, role }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Your login has expired. Please log in again.' })
  }
}

// Is the person an admin?
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' })
  }
  next()
}
// Is the person a customer?
exports.customerOnly = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'This chat is for customers.' })
  }
  next()
}