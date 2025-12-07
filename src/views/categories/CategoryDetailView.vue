<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { fetchCategoryById } from '@/api/categoryApi'

const route = useRoute()
const router = useRouter()

const category = ref(null)
const isLoading = ref(false)
const error = ref('')

const loadCategory = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await fetchCategoryById(route.params.id)
    category.value = data
  } catch (err) {
    error.value = err?.message ?? 'Không thể tải thông tin danh mục.';
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'category-list' })
}

const goEdit = () => {
  router.push({ name: 'category-edit', params: { id: route.params.id } })
}

onMounted(loadCategory)
</script>

<template>
  <section class="card detail">
    <div class="detail__header">
      <div>
        <p class="eyebrow">Thông tin danh mục</p>
        <h2>{{ category?.display_name ?? category?.name ?? 'Danh mục' }}</h2>
        <p class="detail__subtitle" v-if="category?.description">{{ category.description }}</p>
      </div>
      <div class="detail__actions">
        <BaseButton variant="outline" size="sm" @click="goBack">Quay lại</BaseButton>
        <BaseButton size="sm" @click="goEdit">Chỉnh sửa</BaseButton>
      </div>
    </div>

    <div v-if="isLoading" class="detail__state">Đang tải thông tin...</div>
    <div v-else-if="error" class="detail__state detail__state--error">{{ error }}</div>
    <div v-else-if="category" class="detail__grid">
      <div>
        <span class="label">Tên hiển thị</span>
        <p>{{ category.display_name ?? category.name ?? '—' }}</p>
      </div>
      <div>
        <span class="label">Slug</span>
        <p>{{ category.slug ?? '—' }}</p>
      </div>
      <div>
        <span class="label">Thứ tự hiển thị</span>
        <p>{{ category.display_order ?? '—' }}</p>
      </div>
      <div>
        <span class="label">Danh mục cha</span>
        <p>{{ category.parent?.display_name ?? category.parent?.name ?? '—' }}</p>
      </div>
      <div>
        <span class="label">Ngày tạo</span>
        <p>{{ category.created_at ? new Date(category.created_at).toLocaleString('vi-VN') : '—' }}</p>
      </div>
      <div>
        <span class="label">Cập nhật lúc</span>
        <p>{{ category.updated_at ? new Date(category.updated_at).toLocaleString('vi-VN') : '—' }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail__actions {
  display: flex;
  gap: 0.5rem;
}

.detail__subtitle {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}

p {
  margin: 0;
  font-weight: 500;
}

.detail__state {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
  text-align: center;
}

.detail__state--error {
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
