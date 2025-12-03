<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useCategoryStore } from '@/store/modules/category'

const router = useRouter()
const store = useCategoryStore()

onMounted(() => {
  store.fetchCategories()
})

const keyword = ref('')

const columns = [
  { key: 'name', label: 'Danh mục' },
  { key: 'description', label: 'Mô tả' },
  { key: 'actions', label: 'Thao tác', class: 'text-right' },
]

const rows = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const data = store.categories.map((category) => ({
    ...category,
    description: category.description || '—',
  }))
  if (!query) {
    return data
  }
  return data.filter((category) => {
    const haystack = `${category.name ?? ''} ${category.description ?? ''}`.toLowerCase()
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

    <AppTable :columns="columns" :rows="rows">
      <template #cell-actions="{ row }">
        <div class="table-actions">
          <button type="button" class="link" @click="openDetail(row)">Xem</button>
          <span>&middot;</span>
          <button type="button" class="link" @click="openEdit(row)">Chỉnh sửa</button>
        </div>
      </template>
    </AppTable>
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

.table-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  font-size: 0.85rem;
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
</style>
