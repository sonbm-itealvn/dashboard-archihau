<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { usePostStore } from '@/store/modules/post'
import { useCategoryStore } from '@/store/modules/category'
import { useCategoryGroupStore } from '@/store/modules/categoryGroup'

const router = useRouter()
const store = usePostStore()
const categoryStore = useCategoryStore()
const categoryGroupStore = useCategoryGroupStore()
const { posts, error: loadError, isLoading } = storeToRefs(store)
const { categories } = storeToRefs(categoryStore)

const closeDropdownOnOutsideClick = (event) => {
  const target = event.target
  const wrapper = document.querySelector('.filter-dropdown-wrapper')
  if (wrapper && !wrapper.contains(target)) {
    showCategoryDropdown.value = false
  }
}

onMounted(() => {
  Promise.all([
    categoryStore.fetchCategories(),
    categoryGroupStore.fetchCategoryGroups(),
    store.fetchPosts(),
  ])
  document.addEventListener('click', closeDropdownOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick)
})

const keyword = ref('')
const selectedCategoryIds = ref([])
const isFiltering = ref(false)
const selectedCount = computed(() => selectedCategoryIds.value.length)
const deletingId = ref(null)
const showCategoryDropdown = ref(false)

const STATUS_TEXTS = {
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  published: 'Đã xuất bản',
  rejected: 'Đã từ chối',
}

const normalizedPosts = computed(() => posts.value.map(normalizePost))

const filteredPosts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) {
    return normalizedPosts.value
  }
  return normalizedPosts.value.filter((post) => {
    const haystack = [post.title, post.authorName, post.categoriesLabel, post.tagsLabel]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const applyCategoryFilter = async () => {
  isFiltering.value = true
  try {
    const ids = selectedCategoryIds.value.filter((id) => id !== null && id !== undefined && id !== '')
    await store.fetchPosts(ids.length ? { category_ids: ids } : undefined)
  } finally {
    isFiltering.value = false
  }
}

const clearCategoryFilter = () => {
  selectedCategoryIds.value = []
  applyCategoryFilter()
}

const toggleCategory = (id) => {
  if (selectedCategoryIds.value.includes(id)) {
    selectedCategoryIds.value = selectedCategoryIds.value.filter((item) => item !== id)
  } else {
    selectedCategoryIds.value = [...selectedCategoryIds.value, id]
  }
}

// Nhóm categories theo category groups
const categoriesByGroup = computed(() => {
  const groups = categoryGroupStore.categoryGroups || []
  const allCategories = categories.value || []
  const result = []

  // Thêm categories theo từng nhóm
  groups.forEach((group) => {
    const groupCategories = allCategories.filter((cat) => cat.category_group_id === group.id)
    if (groupCategories.length > 0) {
      result.push({
        groupId: group.id,
        groupName: group.name,
        categories: groupCategories,
      })
    }
  })

  // Thêm categories không thuộc nhóm nào (category_group_id = null)
  const ungroupedCategories = allCategories.filter((cat) => !cat.category_group_id)
  if (ungroupedCategories.length > 0) {
    result.push({
      groupId: null,
      groupName: 'Danh mục khác',
      categories: ungroupedCategories,
    })
  }

  return result
})

const handleCreate = () => {
  router.push({ name: 'post-form' })
}

const handleEdit = (post) => {
  router.push({ name: 'post-edit', params: { id: post.id } })
}

const showPlaceholder = (message) => {
  if (typeof window !== 'undefined') {
    window.alert(message)
  } else {
    console.info(message)
  }
}

const handleQuickEdit = () => {
  showPlaceholder('Tính năng "Sửa nhanh" sẽ được bổ sung trong phiên bản tới.')
}

const handleDelete = async (post) => {
  if (!post?.id) return
  if (!window.confirm(`Bạn có chắc muốn xóa bài viết "${post.title}"?`)) return
  deletingId.value = post.id
  try {
    await store.deletePost(post.id)
  } catch (error) {
    showPlaceholder(error?.message ?? 'Không thể xóa bài viết.')
  } finally {
    deletingId.value = null
  }
}

const handlePreview = (post) => {
  if (typeof window === 'undefined') return
  if (post.slug) {
    const url = post.slug.startsWith('http') ? post.slug : `${window.location.origin}/${post.slug}`
    window.open(url, '_blank', 'noopener')
  } else {
    showPlaceholder('Bài viết chưa có đường dẫn xem trước.')
  }
}

function normalizePost(post) {
  const title = post.title ?? 'Không có tiêu đề'
  const authorName =
    post.author?.full_name ?? post.author?.name ?? post.author_name ?? post.author ?? '—'

  const categories = extractRelationNames(post, 'postCategories', 'category', 'categories')
  const tags = extractRelationNames(post, 'postTags', 'tag', 'tags')
  const publishedAt = post.published_at ?? post.schedule_at ?? post.updated_at ?? post.created_at ?? null
  const statusKey = String(post.status ?? '').toLowerCase()

  return {
    ...post,
    title,
    authorName,
    categories,
    tags,
    categoriesLabel: categories.join(', ') || '—',
    tagsLabel: tags.join(', ') || '—',
    commentCount:
      typeof post.comment_count === 'number'
        ? post.comment_count
        : Array.isArray(post.comments)
          ? post.comments.length
          : 0,
    timeLabel: buildTimeLabel(statusKey, publishedAt),
    statusKey,
    statusText: STATUS_TEXTS[statusKey] ?? 'Không rõ trạng thái',
    categoriesDisplay: categories.join(', ') || '—',
    tagsDisplay: tags.join(', ') || '—',
    excerpt: post.excerpt ?? '',
  }
}

function extractRelationNames(post, relationKey, nestedKey, fallbackKey) {
  if (Array.isArray(post[relationKey])) {
    return post[relationKey]
      .map((relation) => relation?.[nestedKey]?.display_name ?? relation?.[nestedKey]?.name ?? relation?.name)
      .filter(Boolean)
  }
  if (Array.isArray(post[fallbackKey])) {
    return post[fallbackKey]
      .map((item) => item?.display_name ?? item?.name ?? item)
      .filter(Boolean)
  }
  return []
}

function buildTimeLabel(statusKey, dateValue) {
  const base = STATUS_TEXTS[statusKey] ?? 'Không rõ trạng thái'
  if (!dateValue) return base
  const formatted = formatVietnamTime(dateValue)
  return formatted ? `${base} ${formatted}` : base
}

function formatVietnamTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const datePart = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const hour24 = date.getHours()
  const period = hour24 >= 12 ? 'chiều' : 'sáng'
  const hour12 = hour24 % 12 || 12
  return `${datePart} lúc ${hour12}:${minutes} ${period}`
}
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Nội dung chính</p>
        <h2>Bài viết</h2>
        <p>Kiểm duyệt bài viết đã xuất bản, bản nháp và lịch lên sóng tại một nơi.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm kiếm bài viết..." @search="handleSearch" />
        </div>
        <BaseButton @click="handleCreate">Thêm bài viết</BaseButton>
      </div>
    </header>

    <div class="filters-bar">
      <div class="filter-dropdown-wrapper">
        <button
          type="button"
          class="filter-dropdown-trigger"
          :class="{ 'has-selection': selectedCount > 0 }"
          @click="showCategoryDropdown = !showCategoryDropdown"
        >
          <span>Lọc theo danh mục</span>
          <span v-if="selectedCount" class="filter-count-badge">{{ selectedCount }}</span>
          <svg
            class="dropdown-icon"
            :class="{ 'is-open': showCategoryDropdown }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div v-if="showCategoryDropdown" class="filter-dropdown" @click.stop>
          <div v-if="!categoriesByGroup.length" class="dropdown-empty">Chưa có danh mục.</div>
          <div v-else class="filter-groups">
            <div v-for="group in categoriesByGroup" :key="group.groupId ?? 'ungrouped'" class="filter-group-item">
              <div class="filter-group-header">
                <h4 class="filter-group-title">{{ group.groupName }}</h4>
                <span class="filter-group-count">({{ group.categories.length }})</span>
              </div>
              <div class="filter-chips">
                <button
                  v-for="category in group.categories"
                  :key="category.id"
                  type="button"
                  class="filter-chip"
                  :class="{ 'is-active': selectedCategoryIds.includes(category.id) }"
                  @click="toggleCategory(category.id)"
                >
                  <span class="dot" aria-hidden="true"></span>
                  <span>{{ category.display_name ?? category.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <BaseButton size="sm" :disabled="isFiltering" @click="applyCategoryFilter">
          {{ isFiltering ? 'Đang lọc...' : 'Lọc' }}
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          type="button"
          :disabled="isFiltering || !selectedCategoryIds.length"
          @click="clearCategoryFilter"
        >
          Xóa lọc
        </BaseButton>
      </div>
    </div>

    <div class="post-table-wrapper">
      <div v-if="isLoading" class="table-state">Đang tải dữ liệu bài viết...</div>
      <div v-else-if="loadError" class="table-state table-state--error">{{ loadError }}</div>
      <template v-else>
        <table class="post-table">
          <thead>
            <tr>
              <th class="col-title">Tiêu đề</th>
              <th>Tác giả</th>
              <th>Danh mục</th>
              <th>Thẻ</th>
              <th class="col-comments" aria-label="Bình luận">
                <svg class="comment-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in filteredPosts" :key="post.id">
              <td>
                <div class="post-title">
                  <div class="post-title__heading">
                    <p class="post-title__text">{{ post.title }}</p>
                    <span class="status-badge" :class="`status-badge--${post.statusKey}`">
                      {{ post.statusText }}
                    </span>
                  </div>
                  <p v-if="post.excerpt" class="post-title__excerpt">{{ post.excerpt }}</p>
                </div>
                <div class="post-row-actions">
                  <button type="button" class="link-action" @click="handleEdit(post)">Chỉnh sửa</button>
                  <span aria-hidden="true">&middot;</span>
                  <button type="button" class="link-action" @click="handleQuickEdit">Sửa nhanh</button>
                  <span aria-hidden="true">&middot;</span>
                  <button
                    type="button"
                    class="link-action is-danger"
                    :disabled="deletingId === post.id"
                    @click="handleDelete(post)"
                  >
                    {{ deletingId === post.id ? 'Đang xóa...' : 'Xóa' }}
                  </button>
                  <span aria-hidden="true">&middot;</span>
                  <button type="button" class="link-action" @click="handlePreview(post)">Xem</button>
                </div>
              </td>
              <td>
                <p class="cell-label">{{ post.authorName }}</p>
              </td>
              <td>
                <div class="meta-pill-group">
                  <span v-for="category in post.categories" :key="category" class="meta-pill">
                    {{ category }}
                  </span>
                  <span v-if="!post.categories.length" class="cell-label">—</span>
                </div>
              </td>
              <td>
                <div class="meta-pill-group">
                  <span v-for="tag in post.tags" :key="tag" class="meta-pill meta-pill--ghost">
                    {{ tag }}
                  </span>
                  <span v-if="!post.tags.length" class="cell-label">—</span>
                </div>
              </td>
              <td class="col-comments">
                <span v-if="post.commentCount" class="comment-count">{{ post.commentCount }}</span>
                <span v-else class="cell-label">—</span>
              </td>
              <td>
                <p class="cell-label">{{ post.timeLabel }}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filteredPosts.length" class="table-empty">
          Không tìm thấy bài viết nào phù hợp với từ khóa "{{ keyword }}".
        </p>
      </template>
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
  align-items: flex-start;
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

.filters-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.filter-dropdown-wrapper {
  position: relative;
}

.filter-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-dropdown-trigger:hover {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.05);
}

.filter-dropdown-trigger.has-selection {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary-hover);
}

.filter-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.4rem;
  border-radius: var(--radius-full);
  background: var(--primary-color);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

.dropdown-icon {
  transition: transform var(--transition-fast);
  color: var(--text-muted);
}

.dropdown-icon.is-open {
  transform: rotate(180deg);
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 100;
  min-width: 500px;
  max-width: 600px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
}

.filter-dropdown::-webkit-scrollbar {
  width: 6px;
}

.filter-dropdown::-webkit-scrollbar-track {
  background: rgba(14, 165, 233, 0.05);
  border-radius: var(--radius-full);
}

.filter-dropdown::-webkit-scrollbar-thumb {
  background: rgba(14, 165, 233, 0.3);
  border-radius: var(--radius-full);
}

.filter-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(14, 165, 233, 0.5);
}

.filter-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-group-item {
  padding: 0.75rem;
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-md);
  background: rgba(248, 250, 252, 0.5);
}

.filter-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
}

.filter-group-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.filter-group-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(15, 76, 129, 0.16);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  background: #f8fafc;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-chip .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 76, 129, 0.35);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.filter-chip.is-active {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.14);
  color: #0f4c81;
  box-shadow: 0 8px 18px rgba(15, 76, 129, 0.1);
}

.filter-chip.is-active .dot {
  background: var(--primary-color);
  transform: scale(1.25);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.dropdown-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
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

.post-table-wrapper {
  border: 1px solid rgba(201, 209, 217, 0.8);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.post-table thead th {
  background: #f6f8fb;
  color: #3b4a5a;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(125, 138, 160, 0.3);
  border-right: 1px solid rgba(125, 138, 160, 0.12);
}

.post-table thead th:last-child,
.post-table tbody td:last-child {
  border-right: none;
}

.col-title {
  width: 32%;
}

.col-comments {
  width: 80px;
  text-align: center;
}

.post-table tbody td {
  padding: 1.1rem 1rem;
  border-bottom: 1px solid rgba(125, 138, 160, 0.15);
  vertical-align: top;
}

.post-table tbody tr:nth-child(even) {
  background: rgba(15, 76, 129, 0.02);
}

.post-table tbody tr:hover {
  background: rgba(23, 119, 209, 0.07);
}

.post-title__text {
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.post-title__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
  background: rgba(15, 23, 42, 0.08);
}

.status-badge--draft {
  background: rgba(251, 191, 36, 0.18);
  color: #92400e;
}

.status-badge--pending {
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}

.status-badge--published {
  background: rgba(16, 185, 129, 0.18);
  color: #047857;
}

.status-badge--rejected {
  background: rgba(239, 68, 68, 0.18);
  color: #b91c1c;
}

.post-title__excerpt {
  margin: 0.15rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.post-row-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
  font-size: 0.8rem;
}

.link-action {
  padding: 0;
  border: none;
  background: none;
  color: #0f6ddf;
  font-weight: 600;
  cursor: pointer;
}

.link-action:hover {
  text-decoration: underline;
}

.link-action.is-danger {
  color: #dc2626;
}

.cell-label {
  margin: 0;
  color: #1f2937;
  font-weight: 500;
}

.comment-icon {
  width: 22px;
  height: 22px;
  color: #162742;
}

.comment-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(15, 76, 129, 0.09);
  color: #0f4c81;
  font-weight: 600;
}

.table-empty {
  margin: 0;
  padding: 1rem 1.25rem 1.5rem;
  color: var(--text-muted);
  font-style: italic;
}

.meta-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.meta-pill {
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(15, 76, 129, 0.08);
  color: #0f4c81;
  font-size: 0.78rem;
  font-weight: 600;
}

.meta-pill--ghost {
  background: rgba(14, 165, 233, 0.12);
  color: #0f6ddf;
}

.table-state {
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-weight: 500;
}

.table-state--error {
  color: var(--danger-color);
}

.muted-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-style: italic;
}

@media (max-width: 640px) {
  .filter-dropdown {
    min-width: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
    left: 0;
    right: 0;
  }

  .filter-groups {
    gap: 0.75rem;
  }

  .filter-group-item {
    padding: 0.5rem;
  }
}
</style>
