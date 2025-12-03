const TOKEN_KEY = 'hau_dashboard_token'

const storage = typeof window !== 'undefined'
  ? window.localStorage
  : {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    }

const tokenService = {
  getToken() {
    return storage.getItem(TOKEN_KEY)
  },
  setToken(value) {
    if (value) {
      storage.setItem(TOKEN_KEY, value)
    } else {
      storage.removeItem(TOKEN_KEY)
    }
  },
  clear() {
    storage.removeItem(TOKEN_KEY)
  },
}

export default tokenService
