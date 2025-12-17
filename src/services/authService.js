import * as authApi from '@/api/authApi'
import tokenService from './tokenService'

export async function login(credentials) {
  const response = await authApi.login(credentials)
  // API now returns access_token; fall back to token for backward compatibility.
  const accessToken = response?.access_token ?? response?.token
  if (accessToken) {
    tokenService.setToken(accessToken)
  }
  return response
}

export async function logout() {
  try {
    await authApi.logout()
  } finally {
    tokenService.clear()
  }
}
