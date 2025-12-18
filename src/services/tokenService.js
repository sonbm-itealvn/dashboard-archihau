const ACCESS_TOKEN_KEY = 'hau_dashboard_access_token'
const REFRESH_TOKEN_KEY = 'hau_dashboard_refresh_token'

const storage = typeof window !== 'undefined'
  ? window.localStorage
  : {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    }

const tokenService = {
  getToken() {
    return storage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    return storage.getItem(REFRESH_TOKEN_KEY)
  },
  setToken(accessToken, refreshToken = null) {
    if (accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    } else {
      storage.removeItem(ACCESS_TOKEN_KEY)
    }
    if (refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  setRefreshToken(refreshToken) {
    if (refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      storage.removeItem(REFRESH_TOKEN_KEY)
    }
  },
  clear() {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
  },
  hasToken() {
    return !!storage.getItem(ACCESS_TOKEN_KEY)
  },
}

export default tokenService
