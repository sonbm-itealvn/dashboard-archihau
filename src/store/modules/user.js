import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as userApi from '@/api/userApi'

const initialUsers = [
  { id: 1, name: 'Jane Cooper', email: 'jane@example.com', roles: ['manager'] },
  { id: 2, name: 'Floyd Miles', email: 'floyd@example.com', roles: ['editor'] },
  { id: 3, name: 'Devon Lane', email: 'devon@example.com', roles: ['author'] },
]

function normalizeUser(user) {
  const roles = Array.isArray(user.userRoles)
    ? user.userRoles
        .map((relation) => relation?.role?.name ?? relation?.role_id)
        .filter(Boolean)
    : Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : []

  return {
    ...user,
    name: user.full_name ?? user.name ?? user.username ?? user.email ?? `User #${user.id ?? ''}`,
    roles,
  }
}

export const useUserStore = defineStore('user', () => {
  const users = ref(initialUsers)
  const selectedUser = ref(initialUsers[0])
  const error = ref('')

  async function fetchUsers() {
    error.value = ''
    try {
      const remote = await userApi.fetchUsers()
      if (Array.isArray(remote) && remote.length) {
        const normalized = remote.map(normalizeUser)
        users.value = normalized
        selectedUser.value = normalized[0]
      }
    } catch (err) {
      if (err?.status === 403) {
        error.value = 'Bạn không có quyền truy cập danh sách người dùng.'
      } else {
        error.value = err?.message ?? 'Không thể tải danh sách người dùng.'
      }
    }
  }

  function selectUser(id) {
    selectedUser.value = users.value.find((user) => String(user.id) === String(id)) ?? null
  }

  return {
    users,
    selectedUser,
    error,
    fetchUsers,
    selectUser,
  }
})
