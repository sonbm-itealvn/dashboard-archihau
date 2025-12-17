<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import { useCategoryGroupStore } from '@/store/modules/categoryGroup'
import { fetchCategories } from '@/api/categoryApi'
import { assignCategoriesToGroup } from '@/api/categoryGroupApi'

const route = useRoute()
const router = useRouter()
const store = useCategoryGroupStore()

const group = ref(null)
const categories = ref([])
const availableCategories = ref([])
const isLoading = ref(false)
const isLoadingCategories = ref(false)
const error = ref('')
const actionError = ref('')
const showAddModal = ref(false)
const selectedCategoryIds = ref([])
const isAssigning = ref(false)

const loadGroup = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const data = await store.fetchCategoryGroupById(route.params.id)
    group.value = data
    // Load categories in this group
    if (data.categories && Array.isArray(data.categories)) {
      categories.value = data.categories
    } else {
      categories.value = []
    }
  } catch (err) {
    error.value = err?.message ?? 'Không thể tải thông tin nhóm danh mục.'
  } finally {
    isLoading.value = false
  }
}

const loadAvailableCategories = async () => {
  isLoadingCategories.value = true
  try {
    const allCategories = await fetchCategories()
    // Filter categories that don't have a category_group_id (null)
    availableCategories.value = Array.isArray(allCategories)
      ? allCategories.filter((cat) => !cat.category_group_id)
      : []
  } catch (err) {
    console.error('Failed to load available categories', err)
    availableCategories.value = []
  } finally {
    isLoadingCategories.value = false
  }
}

const openAddModal = async () => {
  selectedCategoryIds.value = []
  await loadAvailableCategories()
  showAddModal.value = true
}

const closeAddModal = () => {
  if (isAssigning.value) return
  showAddModal.value = false
  selectedCategoryIds.value = []
  actionError.value = ''
}

watch(showAddModal, (newVal) => {
  if (!newVal) {
    selectedCategoryIds.value = []
    actionError.value = ''
  }
})

const handleAssignCategories = async () => {
  if (!selectedCategoryIds.value.length) {
    actionError.value = 'Vui lòng chọn ít nhất một danh mục.'
    return
  }

  actionError.value = ''
  isAssigning.value = true
  try {
    await assignCategoriesToGroup(route.params.id, selectedCategoryIds.value)
    // Reload group to get updated categories
    await loadGroup()
    // Đóng modal sau khi thêm thành công
    isAssigning.value = false
    showAddModal.value = false
    selectedCategoryIds.value = []
    actionError.value = ''
  } catch (err) {
    actionError.value = err?.message ?? 'Không thể thêm danh mục vào nhóm. Vui lòng thử lại.'
    isAssigning.value = false
  }
}

const toggleCategorySelection = (categoryId) => {
  const index = selectedCategoryIds.value.indexOf(categoryId)
  if (index > -1) {
    selectedCategoryIds.value.splice(index, 1)
  } else {
    selectedCategoryIds.value.push(categoryId)
  }
}

const goBack = () => {
  router.push({ name: 'category-group-list' })
}

const goEdit = () => {
  router.push({ name: 'category-group-edit', params: { id: route.params.id } })
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

onMounted(loadGroup)
</script>

<template>
  <section class="card detail">
    <div class="detail__header">
      <div>
        <p class="eyebrow">Thông tin nhóm danh mục</p>
        <h2>{{ group?.name ?? 'Nhóm danh mục' }}</h2>
        <p v-if="group?.description" class="detail__subtitle">{{ group.description }}</p>
      </div>
      <div class="detail__actions">
        <BaseButton variant="outline" size="sm" @click="goBack">Quay lại</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="goEdit">Chỉnh sửa</BaseButton>
        <BaseButton size="sm" @click="openAddModal">Thêm danh mục</BaseButton>
      </div>
    </div>

    <div v-if="isLoading" class="detail__state">Đang tải thông tin...</div>
    <div v-else-if="error" class="detail__state detail__state--error">{{ error }}</div>
    <div v-else-if="group" class="detail__content">
      <div class="detail__info">
        <div class="info-grid">
          <div>
            <span class="label">Tên nhóm</span>
            <p>{{ group.name ?? '—' }}</p>
          </div>
          <div>
            <span class="label">Slug</span>
            <p>{{ group.slug ?? '—' }}</p>
          </div>
          <div>
            <span class="label">Thứ tự hiển thị</span>
            <p>{{ group.display_order ?? '—' }}</p>
          </div>
          <div>
            <span class="label">Số danh mục</span>
            <p><strong>{{ categories.length }}</strong></p>
          </div>
          <div>
            <span class="label">Ngày tạo</span>
            <p>{{ formatDateTime(group.created_at) }}</p>
          </div>
          <div>
            <span class="label">Cập nhật lúc</span>
            <p>{{ formatDateTime(group.updated_at) }}</p>
          </div>
        </div>
      </div>

      <div class="categories-section">
        <div class="section-header">
          <h3>Danh sách danh mục trong nhóm</h3>
          <BaseButton size="sm" @click="openAddModal">+ Thêm danh mục</BaseButton>
        </div>

        <div v-if="!categories.length" class="empty-state">
          <p>Chưa có danh mục nào trong nhóm này.</p>
          <BaseButton size="sm" @click="openAddModal">Thêm danh mục đầu tiên</BaseButton>
        </div>
        <div v-else class="categories-list">
          <div v-for="category in categories" :key="category.id" class="category-item">
            <div class="category-info">
              <h4>{{ category.display_name ?? category.name ?? 'Danh mục không tên' }}</h4>
              <p v-if="category.description" class="category-description">{{ category.description }}</p>
              <div class="category-meta">
                <span class="badge">Slug: {{ category.slug ?? '—' }}</span>
                <span v-if="category.display_order !== null && category.display_order !== undefined" class="badge">
                  Thứ tự: #{{ category.display_order }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thêm danh mục -->
    <AppModal v-model="showAddModal" title="Thêm danh mục vào nhóm">
      <div v-if="isLoadingCategories" class="modal-state">Đang tải danh sách danh mục...</div>
      <div v-else-if="!availableCategories.length" class="modal-state">
        Không có danh mục nào có thể thêm vào nhóm. Tất cả danh mục đã được gán vào nhóm khác.
      </div>
      <div v-else class="category-selector">
        <p class="selector-hint">Chọn các danh mục muốn thêm vào nhóm:</p>
        <div class="category-checkboxes">
          <label
            v-for="category in availableCategories"
            :key="category.id"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              :value="category.id"
              :checked="selectedCategoryIds.includes(category.id)"
              @change="toggleCategorySelection(category.id)"
            />
            <div class="checkbox-content">
              <span class="checkbox-label">{{ category.display_name ?? category.name ?? 'Danh mục không tên' }}</span>
              <span v-if="category.slug" class="checkbox-hint">{{ category.slug }}</span>
            </div>
          </label>
        </div>
        <p v-if="actionError" class="form-error">{{ actionError }}</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" type="button" @click="closeAddModal" :disabled="isAssigning">
          Hủy
        </BaseButton>
        <BaseButton
          type="button"
          @click="handleAssignCategories"
          :disabled="isAssigning || !selectedCategoryIds.length"
        >
          {{ isAssigning ? 'Đang thêm...' : `Thêm ${selectedCategoryIds.length ? `(${selectedCategoryIds.length})` : ''}` }}
        </BaseButton>
      </template>
    </AppModal>
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail__subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
}

.detail__state {
  padding: 2rem;
  text-align: center;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
}

.detail__state--error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger-color);
}

.detail__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail__info {
  padding: 1.5rem;
  background: rgba(14, 165, 233, 0.04);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(14, 165, 233, 0.15);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.info-grid p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 500;
}

.categories-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  border-radius: var(--radius-lg);
  background: rgba(14, 165, 233, 0.04);
  border: 2px dashed rgba(14, 165, 233, 0.2);
}

.empty-state p {
  margin: 0 0 1rem;
  color: var(--text-muted);
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.category-item {
  padding: 1.25rem;
  border: 1px solid rgba(219, 234, 254, 0.6);
  border-radius: var(--radius-lg);
  background: #fff;
  transition: all var(--transition-fast);
}

.category-item:hover {
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.category-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-color);
}

.category-description {
  margin: 0 0 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.category-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(14, 165, 233, 0.12);
  color: var(--primary-hover);
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.modal-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.category-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selector-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.category-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.checkbox-item:hover {
  background: rgba(14, 165, 233, 0.05);
}

.checkbox-item input[type="checkbox"] {
  margin-top: 0.25rem;
  cursor: pointer;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.checkbox-label {
  font-weight: 500;
  color: var(--text-color);
}

.checkbox-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.form-error {
  margin: 0;
  color: var(--danger-color);
  font-weight: 500;
  font-size: 0.875rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
</style>

