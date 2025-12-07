<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const store = useUserStore()

onMounted(() => {
  store.fetchUsers()
})

const keyword = ref('')
const isConfirmOpen = ref(false)
const isDeleting = ref(false)
const userToDelete = ref(null)
const localError = ref('')

const ROLE_LABELS = {
  manager: 'Quản lý',
  editor: 'Biên tập viên',
  contributor: 'Cộng tác viên',
  author: 'Tác giả',
  subscriber: 'Thành viên đăng ký',
}

const columns = [
  { key: 'name', label: 'Họ tên' },
  { key: 'email', label: 'Email' },
  { key: 'roles', label: 'Vai trò' },
  { key: 'actions', label: 'Thao tác', class: 'text-right' },
]

const rows = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) {
    return store.users
  }
  return store.users.filter((user) => {
    const haystack = `${user.name ?? ''} ${user.email ?? ''} ${(user.roles ?? []).join(' ')}`.toLowerCase()
    return haystack.includes(query)
  })
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const openDelete = (user) => {
  userToDelete.value = user
  isConfirmOpen.value = true
  localError.value = ''
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  isDeleting.value = true
  localError.value = ''

  const roleName =
    Array.isArray(userToDelete.value.roles) && userToDelete.value.roles.length
      ? userToDelete.value.roles[0]
      : 'manager'

  try {
    await store.removeRoleFromUser(userToDelete.value.id, roleName)
    isConfirmOpen.value = false
    userToDelete.value = null
  } catch (err) {
    localError.value = err?.message ?? 'Không thể xóa người dùng.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <h2>Quản lý người dùng</h2>
        <p>Kiểm soát quyền truy cập và vai trò trên toàn hệ thống.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm kiếm người dùng..." @search="handleSearch" />
        </div>
        <BaseButton @click="router.push({ name: 'user-form' })">Thêm người dùng</BaseButton>
      </div>
    </header>

    <div v-if="store.error" class="alert">
      {{ store.error }}
    </div>
    <div v-if="!store.error && localError" class="alert">
      {{ localError }}
    </div>
    <AppTable v-if="!store.error" :columns="columns" :rows="rows">
      <template #cell-roles="{ value }">
        {{ (value ?? []).map((role) => ROLE_LABELS[role] ?? role).join(', ') }}
      </template>
      <template #cell-actions="{ row }">
        <div class="actions">
          <BaseButton size="sm" variant="ghost" @click="router.push({ name: 'user-detail', params: { id: row.id } })">
            Xem
          </BaseButton>
          <BaseButton size="sm" variant="outline" @click="router.push({ name: 'user-edit', params: { id: row.id } })">
            Sửa
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            :disabled="isDeleting && userToDelete?.id === row.id"
            @click="openDelete(row)"
          >
            {{ isDeleting && userToDelete?.id === row.id ? 'Đang xóa...' : 'Xóa' }}
          </BaseButton>
        </div>
      </template>
    </AppTable>

    <ConfirmDialog
      v-model="isConfirmOpen"
      title="Xóa người dùng"
      :message="`Bạn có chắc muốn xóa ${userToDelete?.name ?? 'người dùng này'}?`"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.page__search {
  min-width: 220px;
  flex: 1;
  max-width: 320px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.alert {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  background: rgba(248, 191, 0, 0.1);
  border: 1px solid rgba(248, 191, 0, 0.3);
  color: #92400e;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.text-right {
  text-align: right;
}
</style>
