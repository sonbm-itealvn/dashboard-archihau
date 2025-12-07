<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useTagStore } from '@/store/modules/tag'

const store = useTagStore()

const keyword = ref('')
const editingTagId = ref(null)
const formError = ref('')
const actionError = ref('')
const isSubmitting = ref(false)
const deletingId = ref(null)

const form = reactive({
  name: '',
  slug: '',
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const resetForm = () => {
  form.name = ''
  form.slug = ''
  formError.value = ''
}

const populateForm = (tag) => {
  form.name = tag.display_name ?? tag.name ?? ''
  form.slug = tag.slug ?? ''
  formError.value = ''
}

const startCreate = () => {
  editingTagId.value = null
  resetForm()
}

const startEdit = (tag) => {
  editingTagId.value = tag.id
  populateForm(tag)
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

onMounted(() => {
  store.fetchTags()
})

const normalizedTags = computed(() =>
  store.tags.map((tag) => {
    const displayName = tag.display_name ?? tag.name ?? 'N/A'
    const slugLabel = tag.slug ?? tag.name ?? 'N/A'
    const usageCount =
      toNumber(tag.post_count) ??
      toNumber(tag.postCount) ??
      (Array.isArray(tag.postTags) ? tag.postTags.length : null) ??
      (Array.isArray(tag.posts) ? tag.posts.length : 0)
    return {
      ...tag,
      displayName,
      slugLabel,
      usageCount,
    }
  }),
)

const filteredTags = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) {
    return normalizedTags.value
  }
  return normalizedTags.value.filter((tag) => `${tag.displayName} ${tag.slugLabel}`.toLowerCase().includes(query))
})

const handleSubmit = async () => {
  formError.value = ''
  actionError.value = ''
  const name = form.name.trim()
  const slug = form.slug.trim()

  if (!name) {
    formError.value = 'Vui lòng nhập tên thẻ.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      name,
      slug: slug || null,
    }
    if (editingTagId.value) {
      await store.updateTag(editingTagId.value, payload)
    } else {
      await store.createTag(payload)
    }
    startCreate()
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể lưu thẻ. Vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (tag) => {
  actionError.value = ''
  if (!window.confirm(`Bạn có chắc muốn xoá thẻ "${tag.displayName}"?`)) {
    return
  }
  deletingId.value = tag.id
  try {
    await store.deleteTag(tag.id)
    if (editingTagId.value === tag.id) {
      startCreate()
    }
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể xoá thẻ. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <h2>Quản lý thẻ</h2>
        <p>Tổ chức bài viết bằng thẻ, tập trung hoặc hiển thị chủ đề dữ liệu.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm thẻ..." @search="handleSearch" />
        </div>
        <BaseButton v-if="editingTagId" variant="secondary" type="button" @click="startCreate">Thêm thẻ mới</BaseButton>
      </div>
    </header>

    <p v-if="store.error" class="alert alert--error">{{ store.error }}</p>

    <div class="tag-layout">
      <div class="tag-panel">
        <div class="tag-panel__header">
          <div>
            <h3>Danh sách thẻ</h3>
            <p class="muted-text">Đang hiển thị {{ filteredTags.length }} thẻ</p>
          </div>
        </div>
        <div v-if="store.isLoading" class="tag-panel__state">Đang tải thẻ...</div>
        <div v-else>
          <div class="tag-table__header">
            <span>Tên thẻ</span>
            <span>Slug</span>
            <span>SL sử dụng</span>
            <span class="text-right">Thao tác</span>
          </div>
          <div v-for="tag in filteredTags" :key="tag.id" class="tag-table__row" :class="{ 'is-active': editingTagId === tag.id }">
            <div class="cell">
              <p class="name">{{ tag.displayName }}</p>
            </div>
            <div class="cell">
              <p class="muted-text">{{ tag.slugLabel }}</p>
            </div>
            <div class="cell text-center">
              <span class="count-pill">{{ tag.usageCount }}</span>
            </div>
            <div class="cell text-right">
              <div class="table-actions">
                <button type="button" class="link" @click="startEdit(tag)">Chỉnh sửa</button>
                <span>&middot;</span>
                <button type="button" class="link link--danger" :disabled="deletingId === tag.id" @click="handleDelete(tag)">
                  {{ deletingId === tag.id ? 'Đang xoá...' : 'Xoá' }}
                </button>
              </div>
            </div>
          </div>
          <p v-if="!filteredTags.length" class="empty-state">Chưa có thẻ phù hợp.</p>
        </div>
      </div>

      <div class="tag-panel tag-panel--form">
        <h3>{{ editingTagId ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới' }}</h3>
        <p class="muted-text">
          {{ editingTagId ? 'Cập nhật tên hoặc slug cho thẻ đang chỉnh.' : 'Tạo thẻ mới được sử dụng trong bài viết.' }}
        </p>
        <form class="tag-form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="tag-name">Tên thẻ</label>
            <input id="tag-name" v-model="form.name" placeholder="Ví dụ: Tin tức" />
          </div>
          <div class="form-field">
            <label for="tag-slug">Slug</label>
            <input id="tag-slug" v-model="form.slug" placeholder="tin-tuc" />
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="form-actions">
            <BaseButton variant="secondary" type="button" @click="startCreate">Huỷ</BaseButton>
            <BaseButton type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang lưu...' : editingTagId ? 'Cập nhật thẻ' : 'Thêm thẻ' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <p v-if="actionError" class="alert alert--error">{{ actionError }}</p>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
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

.tag-layout {
  display: grid;
  grid-template-columns: minmax(320px, 3fr) minmax(260px, 2fr);
  gap: 1.5rem;
}

.tag-panel {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  background: #fff;
  padding: 1.25rem;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-panel__header h3 {
  margin: 0;
}

.tag-panel__state {
  padding: 1rem;
  text-align: center;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
}

.tag-table__header,
.tag-table__row {
  display: grid;
  grid-template-columns: minmax(140px, 2fr) minmax(120px, 2fr) 120px 120px;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0.25rem;
}

.tag-table__header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3b4a5a;
}

.tag-table__row {
  border-top: 1px solid rgba(219, 234, 254, 0.8);
}

.tag-table__row.is-active {
  background: rgba(14, 165, 233, 0.08);
}

.cell .name {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.muted-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
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

.text-center {
  justify-content: center;
  align-items: center;
}

.text-right {
  justify-content: flex-end;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
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

.link--danger {
  color: var(--danger-color);
}

.link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 1.25rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

.tag-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field input {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.form-error {
  margin: 0;
  color: var(--danger-color);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

@media (max-width: 960px) {
  .tag-layout {
    grid-template-columns: 1fr;
  }

  .tag-table__header,
  .tag-table__row {
    grid-template-columns: 1fr;
    row-gap: 0.5rem;
  }

  .table-actions {
    justify-content: flex-start;
  }

  .text-right,
  .text-center {
    justify-content: flex-start;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .page__actions {
    justify-content: stretch;
  }
}
</style>
