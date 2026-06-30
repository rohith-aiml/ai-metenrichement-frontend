/**
 * Vercel Serverless Proxy
 *
 * All /api/* requests are forwarded here server-side.
 * HF_TOKEN is read from Vercel environment variables — never exposed to the browser.
 */

const BACKEND = 'https://rohith696m-ai-metaenrichment-backend.hf.space'

export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean)
  const pathname = '/' + segments.join('/')

  const params = { ...req.query }
  delete params.path
  const qs = new URLSearchParams(params).toString()
  const targetUrl = `${BACKEND}${pathname}${qs ? '?' + qs : ''}`

  const headers = { 'Content-Type': 'application/json' }
  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fetchOptions = {
    method: req.method,
    headers,
    redirect: 'error',
  }

  if (!['GET', 'HEAD'].includes(req.method) && req.body) {
    fetchOptions.body = JSON.stringify(req.body)
  }

  try {
    const backendRes = await fetch(targetUrl, fetchOptions)
    const text = await backendRes.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }
    res.status(backendRes.status).json(data)
  } catch (err) {
    console.error(`Proxy error → ${targetUrl}:`, err.message)
    res.status(502).json({ detail: `Proxy error: ${err.message}` })
  }
}
