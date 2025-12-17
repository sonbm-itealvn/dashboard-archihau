<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useCategoryGroupStore } from '@/store/modules/categoryGroup'

const router = useRouter()
const store = useCategoryGroupStore()

onMounted(() => {
  store.fetchCategoryGroups()
})

const keyword = ref('')
const actionError = ref('')
const deletingId = ref(null)

const filteredGroups = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) {
    return store.categoryGroups
  }
  return store.categoryGroups.filter((group) => {
    const haystack = `${group.name ?? ''} ${group.description ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const openDetail = (group) => {
  router.push({ name: 'category-group-detail', params: { id: group.id } })
}

const openEdit = (group) => {
  router.push({ name: 'category-group-edit', params: { id: group.id } })
}

const handleDelete = async (group) => {
  actionError.value = ''

  const confirmed = typeof window === 'undefined' ? true : window.confirm(`Bạn có chắc muốn xoá nhóm "${group.name ?? 'N/A'}"?`)
  if (!confirmed) return

  deletingId.value = group.id
  try {
    await store.deleteCategoryGroup(group.id)
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể xoá nhóm danh mục. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Quản lý danh mục</p>
        <h2>Nhóm danh mục</h2>
        <p>Tổ chức và quản lý các nhóm danh mục để phân loại nội dung hiệu quả.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm kiếm nhóm danh mục..." @search="handleSearch" />
        </div>
        <BaseButton @click="router.push({ name: 'category-group-form' })">Thêm nhóm mới</BaseButton>
      </div>
    </header>

    <p v-if="store.error" class="alert alert--error">{{ store.error }}</p>
    <p v-if="actionError" class="alert alert--error">{{ actionError }}</p>

    <div v-if="store.isLoading" class="panel__state">Đang tải danh sách nhóm danh mục...</div>
    <div v-else-if="!filteredGroups.length" class="panel__state">Chưa có nhóm danh mục nào.</div>
    <div v-else class="group-list">
      <div v-for="group in filteredGroups" :key="group.id" class="group-card">
        <div class="group-card__content">
          <div class="group-header">
            <h4 class="group-title">{{ group.name ?? 'Nhóm không tên' }}</h4>
            <div class="group-badges">
              <span class="badge badge--order">#{{ group.display_order ?? group.id ?? '—' }}</span>
            </div>
          </div>
          
          <p v-if="group.description" class="group-description">{{ group.description }}</p>
          <p v-else class="group-description group-description--muted">Chưa có mô tả.</p>
          
          <div class="group-meta">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="meta-text">Tạo lúc {{ formatDateTime(group.created_at) }}</span>
            </span>
            <span v-if="group.updated_at && group.updated_at !== group.created_at" class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3 15c0 4.2 3.8 7 8 7s8-2.8 8-7V9c0-4.2-3.8-7-8-7S3 4.8 3 9v6z"></path>
              </svg>
              <span class="meta-text">Cập nhật: {{ formatDateTime(group.updated_at) }}</span>
            </span>
          </div>
        </div>

        <div class="group-card__actions">
          <BaseButton size="sm" variant="outline" type="button" @click="openDetail(group)">Xem chi tiết</BaseButton>
          <BaseButton size="sm" variant="ghost" type="button" @click="openEdit(group)">Chỉnh sửa</BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            type="button"
            :disabled="deletingId === group.id"
            @click="handleDelete(group)"
          >
            {{ deletingId === group.id ? 'Đang xoá...' : 'Xoá' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
  min-width: 240px;
  flex: 1;
  max-width: 360px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}

.alert--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--danger-color);
}

.panel__state {
  padding: 2rem;
  text-align: center;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
}

.group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.group-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(219, 234, 254, 0.6);
  border-radius: var(--radius-lg);
  background: #fff;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.group-card:hover {
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.group-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.group-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  flex: 1;
}

.group-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge--order {
  background: rgba(14, 165, 233, 0.12);
  color: var(--primary-hover);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.group-description {
  margin: 0;
  color: var(--text-color);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.group-description--muted {
  color: var(--text-muted);
  font-style: italic;
}

.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(219, 234, 254, 0.4);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.meta-item svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.meta-text {
  white-space: nowrap;
}

.group-card__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(219, 234, 254, 0.4);
}

@media (max-width: 768px) {
  .group-list {
    grid-template-columns: 1fr;
  }

  .page__actions {
    justify-content: stretch;
  }

  .page__search {
    max-width: 100%;
  }
}
</style>

