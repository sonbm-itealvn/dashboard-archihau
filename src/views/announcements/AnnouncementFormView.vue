<script setup>
import { reactive, computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { createPost, updatePost, fetchPostById } from '@/api/postApi'
import { useCategoryStore } from '@/store/modules/category'
import { useCategoryGroupStore } from '@/store/modules/categoryGroup'
import { useTagStore } from '@/store/modules/tag'
import { useMediaStore } from '@/store/modules/media'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const categoryGroupStore = useCategoryGroupStore()
const tagStore = useTagStore()
const mediaStore = useMediaStore()
const formError = ref('')
const loadError = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const thumbnailInputRef = ref(null)
const thumbnailError = ref('')
const contentImageInputRef = ref(null)
const contentVideoInputRef = ref(null)
const editorRef = ref(null)
const insertedMedia = ref([]) // Lưu media đã chèn để preview và merge khi submit

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
const thumbnailPreview = computed(() => form.thumbnail?.trim() || '')
const isUploadingThumbnail = computed(() => mediaStore.isUploading)
const isUploadingContent = computed(() => mediaStore.isUploading)

// Tìm category group "Thông báo"
const announcementGroup = computed(() => {
  const groups = categoryGroupStore.categoryGroups || []
  return groups.find(
    (group) =>
      group.name?.toLowerCase().includes('thông báo') ||
      group.name?.toLowerCase().includes('thong bao') ||
      group.slug?.toLowerCase().includes('thong-bao')
  )
})

const goBack = () => {
  router.push({ name: 'announcement-list' })
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
    loadError.value = error?.message ?? 'Không thể tải thông báo.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    categoryGroupStore.fetchCategoryGroups(),
    tagStore.fetchTags(),
  ])
  if (isEditing.value) {
    await loadPost()
  } else {
    resetForm()
  }
})

// Nhóm categories theo category groups - chỉ hiển thị nhóm thông báo
const categoriesByGroup = computed(() => {
  if (!announcementGroup.value) return []
  const allCategories = categoryStore.categories || []
  const groupCategories = allCategories
    .filter((cat) => cat.category_group_id === announcementGroup.value.id)
    .map((category) => ({
      id: category.id,
      label: category.display_name || category.name,
    }))

  if (groupCategories.length === 0) return []
  return [
    {
      groupId: announcementGroup.value.id,
      groupName: announcementGroup.value.name,
      categories: groupCategories,
    },
  ]
})

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
  placeholder: 'Nhập nội dung thông báo...',
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
  },
}

const handleEditorReady = (editor) => {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  editorRef.value = null
})

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

const triggerThumbnailPicker = () => {
  thumbnailInputRef.value?.click()
}

const handleThumbnailFileChange = async (event) => {
  const [file] = event.target.files ?? []
  event.target.value = ''
  if (!file) return
  thumbnailError.value = ''
  try {
    const uploaded = await mediaStore.uploadMedia({ file, resourceType: 'image' })
    form.thumbnail = uploaded?.url ?? ''
  } catch (error) {
    thumbnailError.value = error?.message ?? 'Tải ảnh đại diện thất bại.'
  }
}

const triggerContentPicker = (type) => {
  if (type === 'image') {
    contentImageInputRef.value?.click()
  } else {
    contentVideoInputRef.value?.click()
  }
}

const insertMediaUrl = (url, type) => {
  if (!url) return
  const safeUrl = url.trim()
  if (!safeUrl) return
  const isVideo = type === 'video'

  if (editorRef.value) {
    const editor = editorRef.value

    // Ảnh: dùng lệnh insertImage có sẵn trong CKEditor (chèn tại con trỏ)
    if (!isVideo && editor.commands.get('insertImage')) {
      try {
        editor.execute('insertImage', { source: safeUrl })
        return
      } catch (e) {
        console.warn('insertImage command failed:', e)
      }
    }

    // Thử chèn video trực tiếp bằng model fragment (nếu CKEditor cho phép)
    if (isVideo) {
      try {
        const mediaHtml = `<figure class="media"><video controls playsinline style="max-width:100%;height:auto;"><source src="${safeUrl}" type="video/mp4" />Trình duyệt không hỗ trợ video.</video></figure>`
        const viewFragment = editor.data.processor.toView(mediaHtml)
        const modelFragment = editor.data.toModel(viewFragment)
        editor.model.change((writer) => {
          editor.model.insertContent(modelFragment, editor.model.document.selection)
        })
        // Nếu nội dung có chứa URL sau khi chèn, coi như thành công
        const afterData = editor.getData() ?? ''
        if (afterData.includes(safeUrl)) {
          return
        }
      } catch (err) {
        console.warn('Insert video via model failed:', err)
      }
    }
  }

  // Fallback: lưu vào danh sách media để merge khi submit (và hiển thị preview riêng)
  const mediaItem = {
    id: Date.now(),
    url: safeUrl,
    type: isVideo ? 'video' : 'image',
  }
  insertedMedia.value = [...insertedMedia.value, mediaItem]
}

const removeInsertedMedia = (id) => {
  insertedMedia.value = insertedMedia.value.filter((item) => item.id !== id)
}

const buildMediaHtml = (item) => {
  if (item.type === 'video') {
    return `<figure class="media-embed"><video controls playsinline style="max-width:100%;height:auto;display:block;margin:1rem auto;"><source src="${item.url}" type="video/mp4" />Trình duyệt không hỗ trợ video.</video></figure>`
  }
  return `<figure class="image"><img src="${item.url}" alt="" style="max-width:100%;height:auto;display:block;margin:1rem auto;" /></figure>`
}

const handleContentFileChange = async (type, event) => {
  const [file] = event.target.files ?? []
  event.target.value = ''
  if (!file) return
  try {
    const uploaded = await mediaStore.uploadMedia({ file, resourceType: type })
    const mediaUrlValue = uploaded?.url ?? uploaded?.secure_url ?? uploaded?.file_url ?? uploaded?.path ?? ''
    insertMediaUrl(mediaUrlValue, type)
  } catch (error) {
    alert(error?.message ?? 'Không thể tải tệp.')
  }
}

const handleSubmit = async () => {
  formError.value = ''
  if (!form.title.trim()) {
    formError.value = 'Vui lòng nhập tiêu đề thông báo.'
    return
  }
  if (!form.body || !form.body.trim()) {
    formError.value = 'Nội dung thông báo không được để trống.'
    return
  }

  isSubmitting.value = true
  try {
    // Merge inserted media vào cuối content
    let finalContent = form.body
    if (insertedMedia.value.length > 0) {
      const mediaHtmls = insertedMedia.value.map(buildMediaHtml).join('\n')
      finalContent = `${finalContent}\n${mediaHtmls}`
    }

    const payload = {
      title: form.title,
      slug: form.slug || null,
      content: finalContent,
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
    router.push({ name: 'announcement-list' })
  } catch (error) {
    formError.value =
      error?.message ??
      `Không thể ${isEditing.value ? 'cập nhật' : 'tạo'} thông báo. Vui lòng kiểm tra dữ liệu và thử lại.`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="card form">
    <header class="form__header">
      <div>
        <p class="eyebrow">{{ isEditing ? 'Cập nhật nội dung' : 'Thêm thông báo mới' }}</p>
        <h2>{{ isEditing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo' }}</h2>
      </div>
      <BaseButton variant="secondary" type="button" @click="goBack">Quay lại danh sách</BaseButton>
    </header>

    <div v-if="isLoading" class="form-state">Đang tải nội dung thông báo...</div>
    <div v-else-if="loadError" class="form-state form-state--error">{{ loadError }}</div>

    <form v-else class="form__body" @submit.prevent="handleSubmit">
      <div class="form__main-grid">
        <!-- Cột trái: Thông tin chính -->
        <div class="form-section form-section--main">
          <h3>Thông tin chính</h3>
          <div class="form-field">
            <label for="title">Tiêu đề *</label>
            <input id="title" v-model="form.title" placeholder="Nhập tiêu đề thông báo" required />
          </div>
          <div class="form-field">
            <label for="slug">Đường dẫn (slug)</label>
            <input id="slug" v-model="form.slug" placeholder="vi-du-thong-bao" />
          </div>
          <div class="form-field">
            <label for="excerpt">Mô tả ngắn</label>
            <textarea id="excerpt" v-model="form.excerpt" rows="3" placeholder="Tóm tắt nội dung chính..." />
          </div>
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
            <div class="thumbnail-input">
              <input id="thumbnail" v-model="form.thumbnail" placeholder="https://cdn.example.com/photo.jpg" />
              <div class="thumbnail-actions">
                <input
                  ref="thumbnailInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleThumbnailFileChange"
                />
                <BaseButton
                  variant="outline"
                  type="button"
                  size="sm"
                  :disabled="isUploadingThumbnail"
                  @click="triggerThumbnailPicker"
                >
                  {{ isUploadingThumbnail ? 'Đang tải...' : 'Chọn ảnh' }}
                </BaseButton>
                <button v-if="form.thumbnail" type="button" class="thumbnail-clear" @click="form.thumbnail = ''">
                  Xóa
                </button>
              </div>
              <p v-if="thumbnailError" class="form-hint form-hint--error">{{ thumbnailError }}</p>
              <div v-if="thumbnailPreview" class="thumbnail-preview">
                <img :src="thumbnailPreview" alt="Ảnh đại diện thông báo" />
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải: Danh mục và thẻ -->
        <div class="form-section form-section--sidebar">
          <h3>Phân loại</h3>
          <div class="form-field">
            <label>Danh mục thông báo</label>
            <div v-if="!categoriesByGroup.length" class="hint">Chưa có danh mục thông báo nào.</div>
            <div v-else class="category-groups">
              <div v-for="group in categoriesByGroup" :key="group.groupId ?? 'ungrouped'" class="category-group">
                <div class="category-group__header">
                  <h4 class="category-group__title">{{ group.groupName }}</h4>
                  <span class="category-group__count">({{ group.categories.length }})</span>
                </div>
                <div class="pill-group">
                  <button
                    v-for="category in group.categories"
                    :key="category.id"
                    type="button"
                    class="pill-option"
                    :class="{ 'is-active': form.categories.includes(category.id) }"
                    @click="toggleCategory(category.id)"
                  >
                    {{ category.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="form-field">
            <label>Thẻ thông báo</label>
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
          <div class="media-toolbar">
            <div class="media-toolbar__header">
              <div>
                <p class="media-toolbar__title">Chèn media vào nội dung</p>
                <p class="media-toolbar__hint">Upload trực tiếp ảnh hoặc video từ thiết bị. Media sẽ hiển thị ngay trong bài.</p>
              </div>
            </div>
            <div class="media-toolbar__actions">
              <BaseButton
                size="sm"
                variant="outline"
                type="button"
                :disabled="isUploadingContent"
                @click="triggerContentPicker('image')"
              >
                {{ isUploadingContent ? 'Đang tải...' : 'Chèn ảnh' }}
              </BaseButton>
              <BaseButton
                size="sm"
                variant="outline"
                type="button"
                :disabled="isUploadingContent"
                @click="triggerContentPicker('video')"
              >
                {{ isUploadingContent ? 'Đang tải...' : 'Chèn video' }}
              </BaseButton>
              <input
                ref="contentImageInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="(e) => handleContentFileChange('image', e)"
              />
              <input
                ref="contentVideoInputRef"
                type="file"
                accept="video/*"
                style="display: none"
                @change="(e) => handleContentFileChange('video', e)"
              />
            </div>
          </div>
          <div class="rich-editor">
            <ckeditor v-model="form.body" :editor="Editor" :config="editorConfig" @ready="handleEditorReady" />
          </div>
          
          <!-- Preview media đã chèn (video sẽ hiển thị ở đây vì CKEditor không hỗ trợ) -->
          <div v-if="insertedMedia.length > 0" class="inserted-media">
            <div class="inserted-media__header">
              <span class="inserted-media__title">Media đã chèn ({{ insertedMedia.length }})</span>
              <span class="inserted-media__hint">Các media này sẽ được thêm vào cuối thông báo khi lưu</span>
            </div>
            <div class="inserted-media__grid">
              <div v-for="item in insertedMedia" :key="item.id" class="inserted-media__item">
                <div class="inserted-media__preview">
                  <video v-if="item.type === 'video'" controls playsinline :src="item.url" class="inserted-media__video"></video>
                  <img v-else :src="item.url" alt="" class="inserted-media__img" />
                </div>
                <div class="inserted-media__actions">
                  <span class="inserted-media__type">{{ item.type === 'video' ? 'Video' : 'Ảnh' }}</span>
                  <button type="button" class="inserted-media__remove" @click="removeInsertedMedia(item.id)">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="goBack">Hủy</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu thông báo' }}
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

.form-hint {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.form-hint--error {
  color: var(--danger-color);
}

.form__main-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  align-items: start;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section--main {
  min-width: 0;
}

.form-section--sidebar {
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.form-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(14, 165, 233, 0.15);
}

.form-section--sidebar {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  background: rgba(248, 250, 252, 0.75);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.form-section--main .form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-section--main .form-field label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-section--main .form-field input,
.form-section--main .form-field textarea,
.form-section--main .form-field select {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
  font-size: 0.9375rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-section--main .form-field input:focus,
.form-section--main .form-field textarea:focus,
.form-section--main .form-field select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

@media (max-width: 1200px) {
  .form__main-grid {
    grid-template-columns: 1fr;
  }

  .form-section--sidebar {
    position: static;
    max-height: none;
  }
}

.rich-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
}

.media-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  padding: 0.85rem;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(14, 165, 233, 0.02));
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}

.media-toolbar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-toolbar__title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.media-toolbar__hint {
  margin: 0.1rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.media-toolbar__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.rich-editor :deep(.ck-toolbar) {
  border: none;
  border-bottom: 1px solid var(--border-color);
  background: rgba(14, 165, 233, 0.08);
}

.rich-editor :deep(.ck-editor__editable) {
  min-height: 320px;
  max-height: 640px;
  overflow: auto;
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

.category-groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.category-group {
  padding: 1rem;
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  background: rgba(248, 250, 252, 0.5);
}

.category-group__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
}

.category-group__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.category-group__count {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
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

.hint {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.thumbnail-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thumbnail-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.thumbnail-clear {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-weight: 600;
  padding: 0.35rem 0.5rem;
}

.thumbnail-preview {
  margin-top: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.35rem;
  background: #fff;
  max-width: 280px;
}

.thumbnail-preview img {
  width: 100%;
  display: block;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

/* Inserted media preview */
.inserted-media {
  margin-top: 1rem;
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(14, 165, 233, 0.04) 100%);
}

.inserted-media__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.inserted-media__title {
  font-weight: 600;
  color: #047857;
  font-size: 0.9rem;
}

.inserted-media__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.inserted-media__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.inserted-media__item {
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #fff;
}

.inserted-media__preview {
  aspect-ratio: 16/9;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inserted-media__video,
.inserted-media__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.inserted-media__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.inserted-media__type {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.inserted-media__remove {
  background: none;
  border: none;
  color: var(--danger-color);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.inserted-media__remove:hover {
  text-decoration: underline;
}
</style>

