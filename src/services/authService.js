import * as authApi from '@/api/authApi'
import tokenService from './tokenService'

export async function login(credentials) {
  const response = await authApi.login(credentials)
  // API returns access_token and refresh_token
  const accessToken = response?.access_token ?? response?.token
  const refreshToken = response?.refresh_token
  
  if (accessToken) {
    tokenService.setToken(accessToken, refreshToken)
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
