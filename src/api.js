// Small fetch wrapper for the Express API. Sends the admin/cashier token when logged in.
const BASE = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'cafe_token'

// Images are served by the API. When the site and the API live on different domains (two Vercel projects),
// a path like /api/menu/ID/image must be prefixed with the API address.
export const assetUrl = (url) => (url && url.startsWith('/') ? `${BASE}${url}` : url)

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage can be unavailable */
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) payload = form
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload })
  } catch {
    throw new Error('Cannot reach the server. Please check your internet connection.')
  }
  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('cafe:logout'))
  }
  return res
}

export async function api(path, opts) {
  const res = await request(path, opts)
  const isJson = (res.headers.get('content-type') || '').includes('json')
  const data = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

// Downloads a file (e.g. the CSV export) with the auth header attached.
export async function download(path, filename) {
  const res = await request(path)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || 'Download failed.')
  }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
