import axios from 'axios'

// In development, Vite proxy handles /api → localhost:5001
// In production, set VITE_API_URL to your Railway backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export default api
