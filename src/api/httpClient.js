import { API_BASE_URL } from '@/utils/constants'
import tokenService from '@/services/tokenService'

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }
  try {
    return await response.json()
  } catch {
    return null
  }
}

export default async function http(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
  } = options

  const requestInit = {
    method,
    headers: {
      ...headers,
    },
  }

  const token = tokenService.getToken()
  if (auth && token) {
    requestInit.headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    if (isFormData(body)) {
      requestInit.body = body
    } else if (typeof body === 'string') {
      requestInit.body = body
    } else {
      requestInit.headers['Content-Type'] = 'application/json'
      requestInit.body = JSON.stringify(body)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestInit)
  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const error = new Error(payload?.message ?? 'Request failed')
    error.status = response.status
    error.details = payload
    throw error
  }

  return payload
}
