<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useCategoryStore } from '@/store/modules/category'

const router = useRouter()
const store = useCategoryStore()

onMounted(() => {
  store.fetchCategories()
})

const keyword = ref('')
const deletingId = ref(null)
const isConfirmOpen = ref(false)
const categoryToDelete = ref(null)
const actionError = ref('')

const filteredCategories = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const data = store.categories.map((category) => ({
    ...category,
    postCount: category.postCount ?? category.posts?.length ?? 0,
  }))
  if (!query) {
    return data
  }
  return data.filter((category) => {
    const haystack = `${category.display_name ?? category.name ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const openDetail = (category) => {
  router.push({ name: 'category-detail', params: { id: category.id } })
}

const openEdit = (category) => {
  router.push({ name: 'category-edit', params: { id: category.id } })
}

const handleDelete = (category) => {
  categoryToDelete.value = category
  isConfirmOpen.value = true
  actionError.value = ''
}

const confirmDelete = async () => {
  if (!categoryToDelete.value) return
  deletingId.value = categoryToDelete.value.id
  actionError.value = ''
  try {
    await store.deleteCategory(categoryToDelete.value.id)
    categoryToDelete.value = null
    isConfirmOpen.value = false
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể xoá danh mục. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}

const cancelDelete = () => {
  isConfirmOpen.value = false
  categoryToDelete.value = null
}

const displayName = (category) => category.display_name ?? category.name ?? '—'
const confirmMessage = computed(
  () => `Bạn có chắc muốn xoá danh mục "${displayName(categoryToDelete.value ?? {})}"?`
)
const initials = (category) => {
  const name = displayName(category)
  return name
    .split(' ')
    .map((word) => word?.[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <h2>Danh mục</h2>
        <p>Sắp xếp bài viết để lọc nhanh và tìm kiếm dễ dàng.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm kiếm danh mục..." @search="handleSearch" />
        </div>
        <BaseButton @click="router.push({ name: 'category-form' })">Thêm danh mục</BaseButton>
      </div>
    </header>

    <div class="category-board">
      <div class="category-board__head">
        <div class="pill">
          Tổng cộng <strong>{{ filteredCategories.length }}</strong> danh mục
        </div>
      </div>

      <div v-if="filteredCategories.length" class="table-shell">
        <div class="table-header">
          <span>Danh mục</span>
          <span>Slug</span>
          <span class="text-center">Số bài viết</span>
          <span class="text-right">Thao tác</span>
        </div>

        <div v-for="category in filteredCategories" :key="category.id" class="table-row">
          <div class="cell cell-name">
            <div class="info">
              <p class="name">{{ displayName(category) }}</p>
            </div>
          </div>

          <div class="cell">
            <span class="badge badge-ghost">{{ category.slug ?? '—' }}</span>
          </div>

          <div class="cell text-center">
            <span class="chip">{{ category.postCount }} bài viết</span>
          </div>

          <div class="cell text-right">
            <div class="row-actions">
              <BaseButton size="sm" variant="ghost" @click="openDetail(category)">Xem</BaseButton>
              <BaseButton size="sm" variant="outline" @click="openEdit(category)">Chỉnh sửa</BaseButton>
              <BaseButton
                size="sm"
                variant="danger"
                :disabled="deletingId === category.id"
                @click="handleDelete(category)"
              >
                {{ deletingId === category.id ? 'Đang xoá...' : 'Xoá' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="empty-state">Không tìm thấy danh mục phù hợp. Vui lòng thử từ khóa khác.</p>
    </div>

    <p v-if="actionError" class="alert alert--error">{{ actionError }}</p>

    <ConfirmDialog
      v-model="isConfirmOpen"
      title="Xoá danh mục"
      :message="confirmMessage"
      @confirm="confirmDelete"
      @update:modelValue="(val) => { if (!val) cancelDelete() }"
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

.category-board {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-board__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  background: rgba(14, 165, 233, 0.12);
  color: #0f4c81;
  font-weight: 600;
}

.table-shell {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.04);
  background: #fff;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: minmax(220px, 2.8fr) minmax(180px, 2fr) 130px 220px;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
}

.table-header {
  background: rgba(14, 165, 233, 0.08);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #3b4a5a;
}

.table-row {
  border-top: 1px solid rgba(219, 234, 254, 0.7);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.table-row:nth-child(odd) {
  background: rgba(14, 165, 233, 0.02);
}

.table-row:hover {
  background: rgba(14, 165, 233, 0.06);
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.cell-name .info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  background: rgba(14, 165, 233, 0.14);
  color: #0f4c81;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
}

.name {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(15, 76, 129, 0.08);
  color: #0f4c81;
  font-weight: 600;
  font-size: 0.85rem;
}

.badge-ghost {
  background: rgba(14, 165, 233, 0.12);
  color: #0f4c81;
  border: 1px solid rgba(14, 165, 233, 0.25);
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  font-weight: 700;
  min-width: 110px;
}

.muted-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.text-center {
  justify-content: center;
}

.text-right {
  justify-content: flex-end;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

.alert {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}

.alert--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--danger-color);
}

@media (max-width: 640px) {
  .page__actions {
    justify-content: stretch;
  }
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }
  .text-center,
  .text-right {
    justify-content: flex-start;
  }
  .row-actions {
    justify-content: flex-start;
  }
}
</style>
