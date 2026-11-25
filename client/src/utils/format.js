// 12000 becomes ₦12,000
export function formatPrice(amount) {
  return '₦' + Number(amount).toLocaleString()
}

// Turns a database date into something easy to read
export function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Where the server lives. Pictures and videos are loaded from here.
export const SERVER_URL = 'http://localhost:5000'

// Turns /uploads/123.jpg into http://localhost:5000/uploads/123.jpg
export function fileUrl(path) {
  return path ? SERVER_URL + path : null
}