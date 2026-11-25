import axios from 'axios'

// All our requests go to the server at this address
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// If the user is logged in, show their "badge" (token) with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api