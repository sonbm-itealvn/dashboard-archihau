import { API_BASE_URL } from '@/utils/constants'
import tokenService from '@/services/tokenService'
import * as authApi from './authApi'

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

// Queue để xử lý các request đang chờ khi refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const logout = () => {
  tokenService.clear()
  if (typeof window !== 'undefined') {
    window.location.href = '/#/login'
  }
}

export default async function http(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    _retry = false,
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

  // Xử lý token hết hạn (401) và tự động refresh
  if (!response.ok && response.status === 401 && auth && !_retry) {
    if (isRefreshing) {
      // Nếu đang refresh, thêm request vào queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          // Retry request với token mới (token đã được lưu trong tokenService)
          return http(path, { ...options, _retry: true })
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    isRefreshing = true
    const refreshToken = tokenService.getRefreshToken()

    if (!refreshToken) {
      // Không có refresh token, logout
      processQueue(new Error('No refresh token'), null)
      logout()
      const error = new Error(payload?.message ?? 'Unauthorized')
      error.status = 401
      error.details = payload
      throw error
    }

    try {
      // Gọi API refresh token
      const refreshResponse = await authApi.refreshToken(refreshToken)
      const { access_token, refresh_token: newRefreshToken } = refreshResponse

      // Lưu token mới
      tokenService.setToken(access_token, newRefreshToken)

      // Xử lý queue
      processQueue(null, access_token)

      // Retry request ban đầu với token mới
      return http(path, { ...options, _retry: true })
    } catch (refreshError) {
      // Refresh token hết hạn hoặc invalid
      processQueue(refreshError, null)
      logout()
      throw refreshError
    } finally {
      isRefreshing = false
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message ?? 'Request failed')
    error.status = response.status
    error.details = payload
    throw error
  }

  return payload
}
