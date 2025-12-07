<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { fetchUserById } from '@/api/userApi'

const route = useRoute()
const router = useRouter()

const ROLE_LABELS: Record<string, string> = {
  manager: 'Quản lý',
  editor: 'Biên tập viên',
  contributor: 'Cộng tác viên',
  author: 'Tác giả',
  subscriber: 'Thành viên đăng ký',
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string
    badge: string
  }
> = {
  active: { label: 'Đang hoạt động', badge: 'badge-success' },
  inactive: { label: 'Tạm khóa', badge: 'badge-warning' },
  banned: { label: 'Đã cấm', badge: 'badge-danger' },
}

const user = ref<Record<string, any> | null>(null)
const isLoading = ref(false)
const error = ref('')

const rolesDisplay = computed(() => {
  if (!user.value) {
    return ''
  }

  const roles = Array.isArray(user.value.roles)
    ? user.value.roles
    : Array.isArray(user.value.userRoles)
      ? user.value.userRoles.map((relation: any) => relation?.role?.name ?? relation?.role_id).filter(Boolean)
      : user.value.role
        ? [user.value.role]
        : []

  return roles.map((role: string) => ROLE_LABELS[role] ?? role).join(', ')
})

const statusLabel = computed(() => {
  const status = user.value?.status
  if (!status) return 'Không xác định'
  return STATUS_CONFIG[status]?.label ?? status
})

const statusBadgeClass = computed(() => {
  const status = user.value?.status
  return STATUS_CONFIG[status]?.badge ?? 'badge-neutral'
})

const avatarText = computed(() => {
  if (!user.value?.name) return ''
  return user.value.name
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const loadUser = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await fetchUserById(route.params.id as string)
    user.value = {
      ...response,
      name: response.full_name ?? response.name ?? response.username ?? response.email ?? `User #${response.id}`,
      roles: Array.isArray(response.userRoles)
        ? response.userRoles.map((relation: any) => relation?.role?.name ?? relation?.role_id).filter(Boolean)
        : response.roles ?? (response.role ? [response.role] : []),
    }
  } catch (err: any) {
    error.value = err?.message ?? 'Không thể tải thông tin người dùng.';
  } finally {
    isLoading.value = false
  }
}

onMounted(loadUser)
</script>

<template>
  <section class="card detail">
    <div v-if="isLoading" class="detail__info-line">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="detail__info-line detail__info-line--error">{{ error }}</div>

    <template v-else-if="user">
      <div class="detail__header">
        <div class="detail__avatar">{{ avatarText }}</div>
        <div class="detail__info">
          <p class="eyebrow">Hồ sơ người dùng</p>
          <h2>{{ user.name }}</h2>
          <span class="badge badge-neutral">{{ rolesDisplay || 'Chưa có vai trò' }}</span>
        </div>
        <div class="detail__actions">
          <BaseButton size="sm" variant="outline" @click="router.push({ name: 'user-edit', params: { id: user.id } })">
            Chỉnh sửa
          </BaseButton>
          <BaseButton size="sm" variant="secondary" @click="router.back()">Quay lại</BaseButton>
        </div>
      </div>

      <div class="detail__grid">
        <div>
          <span class="label">Email</span>
          <p class="detail__value">{{ user.email || '-' }}</p>
        </div>
        <div>
          <span class="label">Trạng thái</span>
          <span class="badge status-pill" :class="statusBadgeClass">{{ statusLabel }}</span>
        </div>
        <div>
          <span class="label">Ngày tạo</span>
          <p class="detail__value">{{ user.created_at ? new Date(user.created_at).toLocaleString() : '-' }}</p>
        </div>
        <div>
          <span class="label">Cập nhật lúc</span>
          <p class="detail__value">{{ user.updated_at ? new Date(user.updated_at).toLocaleString() : '-' }}</p>
        </div>
      </div>
    </template>

    <p v-else>Không tìm thấy thông tin người dùng.</p>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail__header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.detail__avatar {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.detail__info h2 {
  margin: 0.25rem 0;
}

.detail__info-line {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.detail__info-line--error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.detail__actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.detail__value {
  margin: 0.35rem 0 0;
  color: var(--text-color);
  font-weight: 500;
}

.status-pill {
  margin-top: 0.35rem;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
