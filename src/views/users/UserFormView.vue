<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { USER_ROLES } from '@/utils/constants'
import { createUser, updateUser, fetchUserById } from '@/api/userApi'

const STATUSES = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Tạm khóa' },
  { value: 'banned', label: 'Bị cấm' },
]

const ROLE_LABELS = {
  manager: 'Quản lý',
  editor: 'Biên tập viên',
  contributor: 'Cộng tác viên',
  author: 'Tác giả',
  subscriber: 'Thành viên đăng ký',
}

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const formError = ref('')
const isLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  fullName: '',
  avatarUrl: '',
  status: STATUSES[0].value,
  role: USER_ROLES[0],
})

const isEditing = computed(() => Boolean(route.params.id))

const normalizeRoles = (user) => {
  if (Array.isArray(user.userRoles)) {
    return user.userRoles
      .map((relation) => relation?.role?.name ?? relation?.role_id)
      .filter(Boolean)
  }
  if (Array.isArray(user.roles)) {
    return user.roles
  }
  if (user.role) {
    return [user.role]
  }
  return []
}

const populateForm = (user) => {
  form.username = user.username ?? ''
  form.email = user.email ?? ''
  form.fullName = user.full_name ?? user.name ?? ''
  form.avatarUrl = user.avatar_url ?? ''
  form.status = user.status ?? STATUSES[0].value
  const roles = normalizeRoles(user)
  form.role = roles.length ? roles[0] : USER_ROLES[0]
  form.password = ''
}

onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true
    formError.value = ''
    try {
      const user = await fetchUserById(route.params.id)
      populateForm(user)
    } catch (error) {
      formError.value = error?.message ?? 'Không thể tải thông tin người dùng.';
    } finally {
      isLoading.value = false
    }
  }
})

const submit = async () => {
  formError.value = ''

  if (!form.role) {
    formError.value = 'Hãy chọn vai trò cho tài khoản.'
    return
  }

  if (!isEditing.value && !form.password) {
    formError.value = 'Vui lòng nhập mật khẩu cho người dùng mới.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      username: form.username,
      email: form.email,
      password_hash: form.password,
      full_name: form.fullName || null,
      avatar_url: form.avatarUrl || null,
      status: form.status,
      roles: [form.role],
    }

    if (isEditing.value) {
      if (!payload.password_hash) {
        delete payload.password_hash
      }
      await updateUser(route.params.id, payload)
    } else {
      await createUser(payload)
    }
    router.push({ name: 'user-list' })
  } catch (error) {
    formError.value = error?.message ?? 'Không thể lưu người dùng.';
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="card form">
    <div class="form__header">
      <div>
        <p class="eyebrow">{{ isEditing ? 'Cập nhật thông tin' : 'Thêm quản trị viên' }}</p>
        <h2>{{ isEditing ? 'Chỉnh sửa người dùng' : 'Tạo người dùng' }}</h2>
        <p class="text-muted">
          Nhập đầy đủ các trường mà API yêu cầu: tài khoản, email, mật khẩu, hồ sơ và vai trò.
        </p>
      </div>
      <BaseButton variant="secondary" @click="router.back()">Hủy</BaseButton>
    </div>

    <form class="form__grid" @submit.prevent="submit">
      <div class="form-field">
        <label for="username">Tên đăng nhập</label>
        <input id="username" v-model="form.username" placeholder="ngoc.anh" required />
      </div>

      <div class="form-field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" placeholder="ban@hau.vn" required />
      </div>

      <div class="form-field">
        <label for="password">Mật khẩu</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Tối thiểu 8 ký tự"
          :required="!isEditing"
        />
        <small class="hint">Bắt buộc khi tạo người dùng mới.</small>
      </div>

      <div class="form-field">
        <label for="fullname">Họ và tên</label>
        <input id="fullname" v-model="form.fullName" placeholder="Ngọc Anh Nguyễn" />
      </div>

      <div class="form-field">
        <label for="avatar">Ảnh đại diện (URL)</label>
        <input id="avatar" v-model="form.avatarUrl" placeholder="https://cdn..." />
      </div>

      <div class="form-field">
        <label for="status">Trạng thái</label>
        <select id="status" v-model="form.status">
          <option v-for="status in STATUSES" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>

      <div class="form-field form-field--full">
        <label>Vai trò</label>
        <div class="role-grid" role="radiogroup" aria-label="Vai trò">
          <label
            v-for="role in USER_ROLES"
            :key="role"
            class="role-option"
            :class="{ 'role-option--active': form.role === role }"
          >
            <input
              v-model="form.role"
              class="role-input"
              type="radio"
              name="role"
              :value="role"
              :aria-checked="form.role === role"
            />
            <span class="role-indicator"></span>
            <span class="role-label">{{ ROLE_LABELS[role] ?? role }}</span>
          </label>
        </div>
      </div>

      <p v-if="isLoading" class="form-info">Đang tải dữ liệu người dùng...</p>
      <p v-if="formError" class="form-error">{{ formError }}</p>

      <div class="form-actions">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu người dùng' }}
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem 1.25rem;
}

.form-field--full {
  grid-column: 1 / -1;
}

.role-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: var(--surface-color);
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.role-option--active {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.12);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0px 8px 20px rgba(37, 99, 235, 0.15);
}

.role-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.role-indicator {
  width: 1rem;
  height: 1rem;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.role-indicator::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  background: transparent;
  transition: transform 0.2s ease, background 0.2s ease;
  transform: scale(0);
}

.role-option--active .role-indicator {
  border-color: var(--primary-color);
}

.role-option--active .role-indicator::after {
  background: var(--primary-color);
  transform: scale(1);
}

.form-info,
.form-error {
  grid-column: 1 / -1;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
}

.form-info {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.form-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.hint {
  color: var(--text-muted);
}
</style>
