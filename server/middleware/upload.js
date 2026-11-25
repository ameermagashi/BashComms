const multer = require('multer')
const path = require('path')
const fs = require('fs')

// The "shelf" where files are kept
const uploadFolder = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    // Give every file a new unique name so two files never clash
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  },
})

// Only these kinds of files are allowed
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WEBP, GIF pictures and MP4, WEBM, MOV videos are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB per file
})

// One picture and one video per product.
// If something is wrong with a file, we send a friendly message.
exports.uploadProductFiles = (req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'A file is too big. The maximum is 50 MB.' : err.message
      return res.status(400).json({ message })
    }
    next()
  })
}