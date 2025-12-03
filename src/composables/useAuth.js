import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()

  const login = async (credentials) => {
    await store.login(credentials)
    router.push({ name: 'dashboard-home' })
  }

  const register = async (payload) => {
    await store.register(payload)
    router.push({ name: 'login' })
  }

  const logout = async () => {
    await store.logout()
    router.push({ name: 'login' })
  }

  return {
    login,
    register,
    logout,
    currentUser: computed(() => store.currentUser),
    isAuthenticated: computed(() => store.isAuthenticated),
  }
}
