<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { createPost, updatePost, fetchPostById } from '@/api/postApi'
import { useCategoryStore } from '@/store/modules/category'
import { useTagStore } from '@/store/modules/tag'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()
const formError = ref('')
const loadError = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'rejected', label: 'Đã từ chối' },
]

const form = reactive({
  title: '',
  status: STATUS_OPTIONS[0].value,
  body: '',
  slug: '',
  excerpt: '',
  thumbnail: '',
  categories: [],
  tags: [],
})

const isEditing = computed(() => Boolean(route.params.id))

const goBack = () => {
  router.push({ name: 'post-list' })
}

const resetForm = () => {
  form.title = ''
  form.status = STATUS_OPTIONS[0].value
  form.body = ''
  form.slug = ''
  form.excerpt = ''
  form.thumbnail = ''
  form.categories = []
  form.tags = []
}

const populateForm = (post) => {
  form.title = post.title ?? ''
  form.slug = post.slug ?? ''
  form.excerpt = post.excerpt ?? ''
  form.status = post.status ?? STATUS_OPTIONS[0].value
  form.thumbnail = post.thumbnail_url ?? ''
  form.body = post.content ?? ''
  form.categories = extractRelationIds(post.postCategories, 'category') ?? form.categories
  form.tags = extractRelationIds(post.postTags, 'tag') ?? form.tags
}

const extractRelationIds = (relations, key) => {
  if (!Array.isArray(relations)) return []
  return relations
    .map((relation) => relation?.[key]?.id ?? relation?.[`${key}_id`] ?? relation?.id)
    .filter(Boolean)
}

const loadPost = async () => {
  if (!isEditing.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    const post = await fetchPostById(route.params.id)
    populateForm(post)
  } catch (error) {
    loadError.value = error?.message ?? 'Không thể tải bài viết.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([categoryStore.fetchCategories(), tagStore.fetchTags()])
  if (isEditing.value) {
    await loadPost()
  } else {
    resetForm()
  }
})

const categoryOptions = computed(() =>
  categoryStore.categories.map((category) => ({
    id: category.id,
    label: category.display_name || category.name,
  })),
)

const tagOptions = computed(() =>
  tagStore.tags.map((tag) => ({
    id: tag.id,
    label: tag.display_name || tag.name,
  })),
)

const Editor = ClassicEditor
const editorConfig = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'blockQuote',
    'insertTable',
    'undo',
    'redo',
  ],
  placeholder: 'Nhập nội dung bài viết...',
}

const toggleCategory = (id) => {
  if (form.categories.includes(id)) {
    form.categories = form.categories.filter((item) => item !== id)
  } else {
    form.categories = [...form.categories, id]
  }
}

const toggleTag = (tagId) => {
  if (form.tags.includes(tagId)) {
    form.tags = form.tags.filter((item) => item !== tagId)
  } else {
    form.tags = [...form.tags, tagId]
  }
}

const handleSubmit = async () => {
  formError.value = ''
  if (!form.title.trim()) {
    formError.value = 'Vui lòng nhập tiêu đề bài viết.'
    return
  }
  if (!form.body || !form.body.trim()) {
    formError.value = 'Nội dung bài viết không được để trống.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      title: form.title,
      slug: form.slug || null,
      content: form.body,
      excerpt: form.excerpt || null,
      status: form.status,
      thumbnail_url: form.thumbnail || null,
      category_ids: form.categories,
      tag_ids: form.tags,
      published_at: null,
    }
    if (isEditing.value) {
      await updatePost(route.params.id, payload)
    } else {
      await createPost(payload)
    }
    router.push({ name: 'post-list' })
  } catch (error) {
    formError.value =
      error?.message ??
      `Không thể ${isEditing.value ? 'cập nhật' : 'tạo'} bài viết. Vui lòng kiểm tra dữ liệu và thử lại.`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="card form">
    <header class="form__header">
      <div>
        <p class="eyebrow">{{ isEditing ? 'Cập nhật nội dung' : 'Thêm bài viết mới' }}</p>
        <h2>{{ isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết' }}</h2>
      </div>
      <BaseButton variant="secondary" type="button" @click="goBack">Quay lại danh sách</BaseButton>
    </header>

    <div v-if="isLoading" class="form-state">Đang tải nội dung bài viết...</div>
    <div v-else-if="loadError" class="form-state form-state--error">{{ loadError }}</div>

    <form v-else class="form__body" @submit.prevent="handleSubmit">
      <div class="form__grid">
        <div class="form-card">
          <h3>Thông tin chính</h3>
          <div class="form-field">
            <label for="title">Tiêu đề</label>
            <input id="title" v-model="form.title" placeholder="Nhập tiêu đề bài viết" required />
          </div>
          <div class="form-field">
            <label for="slug">Đường dẫn (slug)</label>
            <input id="slug" v-model="form.slug" placeholder="vi-du-bai-viet" />
          </div>
          <div class="form-field">
            <label for="excerpt">Mô tả ngắn</label>
            <textarea id="excerpt" v-model="form.excerpt" rows="3" placeholder="Tóm tắt nội dung chính..." />
          </div>
        </div>

        <div class="form-card">
          <h3>Thiết lập hiển thị</h3>
          <div class="form-field">
            <label for="status">Trạng thái</label>
            <select id="status" v-model="form.status">
              <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label for="thumbnail">Ảnh đại diện</label>
            <input id="thumbnail" v-model="form.thumbnail" placeholder="https://cdn.example.com/photo.jpg" />
          </div>
          <div class="form-field">
            <label>Danh mục bài viết</label>
            <div class="pill-group">
              <button
                v-for="category in categoryOptions"
                :key="category.id"
                type="button"
                class="pill-option"
                :class="{ 'is-active': form.categories.includes(category.id) }"
                @click="toggleCategory(category.id)"
              >
                {{ category.label }}
              </button>
              <p v-if="!categoryOptions.length" class="hint">Chưa có danh mục nào.</p>
            </div>
          </div>
          <div class="form-field">
            <label>Thẻ bài viết</label>
            <div class="pill-group">
              <button
                v-for="tag in tagOptions"
                :key="tag.id"
                type="button"
                class="pill-option"
                :class="{ 'is-active': form.tags.includes(tag.id) }"
                @click="toggleTag(tag.id)"
              >
                {{ tag.label }}
              </button>
              <p v-if="!tagOptions.length" class="hint">Chưa có thẻ nào.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-card">
        <div class="form-field">
          <label for="body">Nội dung chi tiết</label>
          <div class="rich-editor">
            <ckeditor v-model="form.body" :editor="Editor" :config="editorConfig" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="goBack">Hủy</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu bài viết' }}
        </BaseButton>
      </div>
      <p v-if="formError" class="form-error">{{ formError }}</p>
    </form>
  </section>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  gap: 1.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-error {
  margin-top: 0.75rem;
  color: var(--danger-color);
  font-weight: 500;
  text-align: right;
}

.form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.form-card {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  background: rgba(248, 250, 252, 0.75);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.form-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--text-secondary);
}

.rich-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
}

.rich-editor :deep(.ck-toolbar) {
  border: none;
  border-bottom: 1px solid var(--border-color);
  background: rgba(14, 165, 233, 0.08);
}

.rich-editor :deep(.ck-editor__editable) {
  min-height: 320px;
  border: none;
  font-size: 0.95rem;
}

.rich-editor :deep(.ck-placeholder) {
  color: var(--text-muted);
}

.form-state {
  padding: 2rem 1rem;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-state--error {
  color: var(--danger-color);
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill-option {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.9rem;
  background: #fff;
  color: var(--text-color);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.pill-option.is-active {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.12);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.2);
}
</style>
