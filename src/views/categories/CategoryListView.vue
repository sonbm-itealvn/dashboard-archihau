<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useCategoryStore } from '@/store/modules/category'

const router = useRouter()
const store = useCategoryStore()

onMounted(() => {
  store.fetchCategories()
})

const keyword = ref('')

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
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Danh mục nội dung</p>
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

    <div class="category-table">
      <div class="category-table__header">
        <span>Danh mục</span>
        <span>Slug</span>
        <span>Số lượt sử dụng</span>
        <span class="text-right">Thao tác</span>
      </div>

      <div v-for="category in filteredCategories" :key="category.id" class="category-table__row">
        <div class="cell cell-name">
          <p class="name">{{ category.display_name ?? category.name ?? '—' }}</p>
        </div>
        <div class="cell">
          <p class="muted-text">{{ category.slug ?? '—' }}</p>
        </div>
        <div class="cell text-center">
          <span class="count-pill">{{ category.postCount }}</span>
        </div>
        <div class="cell text-right">
          <div class="table-actions">
            <button type="button" class="link" @click="openDetail(category)">Xem</button>
            <span>&middot;</span>
            <button type="button" class="link" @click="openEdit(category)">Chỉnh sửa</button>
          </div>
        </div>
      </div>

      <p v-if="!filteredCategories.length" class="empty-state">
        Không tìm thấy danh mục phù hợp. Vui lòng thử từ khóa khác.
      </p>
    </div>
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

.category-table {
  margin-top: 1rem;
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.06);
  background: #fff;
}

.category-table__header,
.category-table__row {
  display: grid;
  grid-template-columns: minmax(160px, 2fr) minmax(200px, 3fr) 120px 140px;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
}

.category-table__header {
  background: rgba(14, 165, 233, 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3b4a5a;
}

.category-table__row {
  border-top: 1px solid rgba(219, 234, 254, 0.8);
}

.category-table__row:nth-child(even) {
  background: rgba(15, 76, 129, 0.02);
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cell-name .name {
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.muted-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.text-center {
  justify-content: center;
  align-items: center;
}

.text-right {
  justify-content: flex-end;
}

.table-actions {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.9rem;
}

.link {
  border: none;
  background: none;
  color: #0f6ddf;
  font-weight: 600;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  background: rgba(14, 165, 233, 0.15);
  color: #0f4c81;
  font-weight: 600;
  min-width: 36px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

@media (max-width: 640px) {
  .page__actions {
    justify-content: stretch;
  }

  .category-table__header,
  .category-table__row {
    grid-template-columns: 1fr;
  }

.category-table__row {
  row-gap: 0.5rem;
}
}
</style>
