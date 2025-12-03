import * as authApi from '@/api/authApi'
import tokenService from './tokenService'

export async function login(credentials) {
  const response = await authApi.login(credentials)
  if (response?.token) {
    tokenService.setToken(response.token)
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
