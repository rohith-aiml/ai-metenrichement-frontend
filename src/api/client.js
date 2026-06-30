import axios from 'axios'

// In production (Vercel), all calls go through /api proxy (token added server-side).
// In dev, calls go directly to the local backend or VITE_BACKEND_URL.
const BACKEND_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080')

// Serialize array params as repeated keys: dates=a&dates=b (FastAPI List[str] compatible)
const api = axios.create({
  baseURL: BACKEND_URL,
  paramsSerializer: (params) => {
    const parts = []
    for (const [key, val] of Object.entries(params)) {
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`))
      } else if (val !== undefined && val !== null && val !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      }
    }
    return parts.join('&')
  },
})

export const getProjects = () =>
  api.get('/projects').then(r => r.data.projects)

export const getContentTypes = (projectId) =>
  api.get('/contenttypes', { params: { project_id: projectId } }).then(r => r.data.content_types)

export const getDates = (projectId, contentType) =>
  api.get('/dates', { params: { project_id: projectId, content_type: contentType } }).then(r => r.data.dates)

export const getPartners = (projectId, contentType, dates) =>
  api.get('/partners', { params: { project_id: projectId, content_type: contentType, dates } }).then(r => r.data.partners)

export const getEnrichedMetaStatuses = (projectId, contentType, dates, partners) =>
  api.get('/enriched_meta_statuses', {
    params: { project_id: projectId, content_type: contentType, dates, partners }
  }).then(r => r.data.statuses)

export const applyFilter = (body) =>
  api.post('/filter', body).then(r => r.data)

export const searchContents = (filterBody, q) =>
  api.post('/search', { ...filterBody, q }).then(r => r.data.results)

export const runEnrich = (body) =>
  api.post('/enrich', body).then(r => r.data)

export const saveMatch = (projectId, contentId, match, manualGenre, manualKeywords) =>
  api.post('/select_match', {
    project_id: projectId,
    contentid: contentId,
    match,
    manual_genre: manualGenre,
    manual_keywords: manualKeywords,
  }).then(r => r.data)

export const removeMatch = (projectId, contentId) =>
  api.post('/remove_match', { project_id: projectId, contentid: contentId }).then(r => r.data)

export const advancedSearch = (projectId, contentId) =>
  api.post('/advanced_search', { project_id: projectId, contentid: contentId }).then(r => r.data)

export const dubbedSearch = (projectId, contentId) =>
  api.post('/dubbed_search', { project_id: projectId, contentid: contentId }).then(r => r.data)

export const manualEnrich = (projectId, contentId) =>
  api.post('/manual_enrich', { project_id: projectId, contentid: contentId }).then(r => r.data)

export const removeManualEnrich = (projectId, contentId) =>
  api.post('/remove_manual_enrich', { project_id: projectId, contentid: contentId }).then(r => r.data)

// items: [{contentid, imgurl}, ...]  →  { results: { contentid: {tag, is_adult, label_detail, ...} } }
export const moderateImages = (items) =>
  api.post('/moderate', { items }, { timeout: 120_000 }).then(r => r.data.results)
