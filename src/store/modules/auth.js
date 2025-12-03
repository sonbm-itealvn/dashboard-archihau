import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginService, logout as logoutService } from '@/services/authService'
import { register as registerRequest, fetchProfile as fetchProfileRequest } from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)

  const isAuthenticated = computed(() => Boolean(currentUser.value))

  async function login(credentials) {
    const response = await loginService(credentials)
    currentUser.value = response?.user ?? { id: 1, name: 'Demo User' }
  }

  async function logout() {
    await logoutService()
    currentUser.value = null
  }

  async function register(payload) {
    return registerRequest(payload)
  }

  async function fetchProfile() {
    const response = await fetchProfileRequest()
    currentUser.value = response?.user ?? null
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    register,
    fetchProfile,
  }
})
