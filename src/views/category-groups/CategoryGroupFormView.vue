<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCategoryGroupStore } from '@/store/modules/categoryGroup'

const route = useRoute()
const router = useRouter()
const store = useCategoryGroupStore()

const formError = ref('')
const loadError = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  displayOrder: '',
})

const isEditing = computed(() => Boolean(route.params.id))

const goBack = () => {
  router.push({ name: 'category-group-list' })
}

const resetForm = () => {
  form.name = ''
  form.slug = ''
  form.description = ''
  form.displayOrder = ''
}

const populateForm = (group) => {
  form.name = group.name ?? ''
  form.slug = group.slug ?? ''
  form.description = group.description ?? ''
  form.displayOrder = group.display_order ?? ''
}

const loadGroup = async () => {
  if (!isEditing.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    const group = await store.fetchCategoryGroupById(route.params.id)
    populateForm(group)
  } catch (error) {
    loadError.value = error?.message ?? 'Không thể tải nhóm danh mục.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) {
    await loadGroup()
  } else {
    resetForm()
  }
})

const handleSubmit = async () => {
  formError.value = ''
  if (!form.name.trim()) {
    formError.value = 'Vui lòng nhập tên nhóm danh mục.'
    return
  }

  const payload = {
    name: form.name.trim(),
    slug: form.slug.trim() || null,
    description: form.description.trim() || null,
    display_order: form.displayOrder ? Number(form.displayOrder) : null,
  }

  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await store.updateCategoryGroup(route.params.id, payload)
    } else {
      await store.createCategoryGroup(payload)
    }
    router.push({ name: 'category-group-list' })
  } catch (error) {
    formError.value =
      error?.message ??
      `Không thể ${isEditing.value ? 'cập nhật' : 'tạo'} nhóm danh mục. Vui lòng thử lại.`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="card form">
    <header class="form__header">
      <div>
        <p class="eyebrow">{{ isEditing ? 'Cập nhật nhóm danh mục' : 'Thêm nhóm danh mục mới' }}</p>
        <h2>{{ isEditing ? 'Chỉnh sửa nhóm danh mục' : 'Tạo nhóm danh mục mới' }}</h2>
      </div>
      <BaseButton variant="secondary" type="button" @click="goBack">Quay lại</BaseButton>
    </header>

    <div v-if="isLoading" class="form-state">Đang tải thông tin nhóm danh mục...</div>
    <div v-else-if="loadError" class="form-state form-state--error">{{ loadError }}</div>

    <form v-else class="form__body" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="name">Tên nhóm danh mục *</label>
        <input id="name" v-model="form.name" placeholder="Ví dụ: Nhóm 1 – Hoạt động & Sự kiện" required />
      </div>
      <div class="form-field">
        <label for="slug">Slug</label>
        <input id="slug" v-model="form.slug" placeholder="nhom-1-hoat-dong-su-kien" />
        <p class="form-hint">URL-friendly identifier. Bỏ trống để tự động tạo từ tên.</p>
      </div>
      <div class="form-field">
        <label for="order">Thứ tự hiển thị</label>
        <input id="order" v-model="form.displayOrder" type="number" min="0" placeholder="Ví dụ: 1" />
        <p class="form-hint">Số nhỏ sẽ hiển thị trước. Bỏ trống để xếp cuối.</p>
      </div>
      <div class="form-field">
        <label for="description">Mô tả</label>
        <textarea id="description" v-model="form.description" rows="4" placeholder="Giới thiệu ngắn về nhóm danh mục..." />
      </div>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="goBack">Hủy</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật nhóm' : 'Tạo nhóm' }}
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field input,
.form-field textarea {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.form-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-error {
  color: var(--danger-color);
  font-weight: 500;
  margin: 0;
}

.form-state {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
  text-align: center;
}

.form-state--error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger-color);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
</style>

