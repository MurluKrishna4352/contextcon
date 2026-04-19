import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchScoutResults(query) {
  const { data } = await api.post('/scout', { query })
  return data
}

export async function fetchCompanyMemo(domain) {
  const { data } = await api.get('/company', { params: { domain } })
  return data
}

export async function fetchHealth() {
  const { data } = await api.get('/health')
  return data
}
