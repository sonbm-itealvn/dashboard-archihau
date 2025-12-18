import http from './httpClient'

const AUTH_BASE = '/auth'

export async function login(payload = {}) {
  const body = {
    identifier: payload.identifier ?? payload.email ?? payload.username ?? '',
    password: payload.password,
  }
  return http(`${AUTH_BASE}/login`, { method: 'POST', body, auth: false })
}

export async function register(payload = {}) {
  const body = {
    username: payload.username ?? payload.email ?? payload.name,
    email: payload.email,
    password: payload.password,
    full_name: payload.full_name ?? payload.name ?? payload.username ?? '',
    avatar_url: payload.avatar_url ?? null,
  }
  return http(`${AUTH_BASE}/register`, { method: 'POST', body, auth: false })
}

export async function logout() {
  try {
    await http(`${AUTH_BASE}/logout`, { method: 'POST' })
  } catch (error) {
    if (error?.status !== 404) {
      throw error
    }
  }
  return true
}

export async function fetchProfile() {
  return http(`${AUTH_BASE}/me`)
}

export async function refreshToken(refreshToken) {
  return http(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    auth: false,
  })
}
