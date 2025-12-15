<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMediaStore } from '@/store/modules/media'

const store = useMediaStore()

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hình ảnh', value: 'Image' },
  { label: 'Video', value: 'Video' },
  { label: 'Tài liệu', value: 'Document' },
]

const activeFilter = ref('all')
const fileInputRef = ref(null)
const isUploading = computed(() => store.isUploading)
const showUploadModal = ref(false)
const selectedFiles = ref([])
const dragActive = ref(false)
const detailItem = ref(null)
const deletingId = ref(null)

const typeLabels = {
  Image: 'Hình ảnh',
  Video: 'Video',
  Document: 'Tài liệu',
}

const displayedMedia = computed(() => {
  const items = activeFilter.value === 'all' ? store.mediaItems : store.mediaItems.filter((item) => item.type === activeFilter.value)
  return items.map((item) => ({
    ...item,
    displayType: typeLabels[item.type] ?? item.type ?? 'Khác',
    displaySize: item.size ?? '—',
    previewUrl: item.url ?? '',
    uploadedByName: item.uploadedBy?.full_name ?? item.uploadedBy?.username ?? item.uploaded_by?.full_name ?? item.uploaded_by?.username ?? 'Không rõ',
    uploadedAtLabel: item.uploadedAt ? new Date(item.uploadedAt).toLocaleString('vi-VN') : '',
  }))
})

const selectedFilesList = computed(() =>
  selectedFiles.value.map((file) => ({
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
  })),
)

const hasSelection = computed(() => selectedFiles.value.length > 0)

const setFilter = (value) => {
  activeFilter.value = value
}

const openUploadModal = () => {
  selectedFiles.value = []
  showUploadModal.value = true
}

const closeUploadModal = () => {
  if (isUploading.value) return
  showUploadModal.value = false
}

const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const appendFiles = (fileList) => {
  const filesArray = Array.from(fileList ?? [])
  if (!filesArray.length) return
  selectedFiles.value = [...selectedFiles.value, ...filesArray]
}

const handleFileChange = (event) => {
  appendFiles(event.target.files)
  event.target.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  dragActive.value = false
  appendFiles(event.dataTransfer?.files)
}

const handleDragOver = (event) => {
  event.preventDefault()
  dragActive.value = true
}

const handleDragLeave = () => {
  dragActive.value = false
}

const removeFile = (index) => {
  selectedFiles.value = selectedFiles.value.filter((_, idx) => idx !== index)
}

const uploadAll = async () => {
  if (!hasSelection.value || isUploading.value) return
  try {
    await store.uploadMediaBatch(selectedFiles.value)
    selectedFiles.value = []
    showUploadModal.value = false
  } catch (error) {
    console.error('Upload failed', error)
    alert(error?.message ?? 'Tải tệp thất bại.')
  }
}

const openDetail = (item) => {
  detailItem.value = item
}

const closeDetail = () => {
  detailItem.value = null
}

const handleDelete = async (item) => {
  if (!item?.id) return
  if (!window.confirm(`Bạn có chắc muốn xóa tệp "${item.name}"?`)) return
  deletingId.value = item.id
  try {
    await store.deleteMedia(item.id)
    if (detailItem.value?.id === item.id) {
      closeDetail()
    }
  } catch (error) {
    alert(error?.message ?? 'Không thể xóa tệp. Vui lòng thử lại.')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  store.fetchMedia()
})
</script>

<template>
  <section class="card media">
    <header class="media__header">
      <div>
        <p class="eyebrow">Kho Media</p>
        <h2>Kho Media</h2>
        <p>Tải lên và quản lý hình ảnh, video, tài liệu một cách đồng bộ.</p>
      </div>
      <div class="media__actions">
        <input ref="fileInputRef" type="file" multiple style="display: none" @change="handleFileChange" />
        <BaseButton variant="outline" size="sm">Đồng bộ</BaseButton>
        <BaseButton :disabled="isUploading" size="sm" @click="openUploadModal">
          {{ isUploading ? 'Đang tải...' : 'Tải tệp' }}
        </BaseButton>
      </div>
    </header>

    <div class="media__toolbar">
      <div class="media__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="['media__filter', { 'is-active': activeFilter === filter.value }]"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="media__grid">
      <article
        v-for="item in displayedMedia"
        :key="item.id"
        class="media__item"
        @click="openDetail(item)"
      >
        <div class="media__thumb" :style="item.previewUrl ? { backgroundImage: `url(${item.previewUrl})` } : {}">
          <span v-if="!item.previewUrl" class="media__icon">{{ (item.displayType ?? '').charAt(0) }}</span>
        </div>
        <div class="media__info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.displayType }}</p>
        </div>
        <span class="badge badge-neutral">{{ item.displaySize }}</span>
      </article>
    </div>

    <teleport to="body">
      <div v-if="showUploadModal" class="upload-modal">
        <div class="upload-modal__backdrop" @click="closeUploadModal"></div>
        <div class="upload-modal__content">
          <header class="upload-modal__header">
            <div>
              <p class="eyebrow">Tải lên</p>
              <h3>Thêm tệp vào thư viện</h3>
            </div>
            <button class="upload-modal__close" type="button" @click="closeUploadModal">×</button>
          </header>

          <div
            class="upload-dropzone"
            :class="{ 'is-active': dragActive }"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <p>Kéo và thả tệp vào đây</p>
            <p class="upload-dropzone__hint">Hoặc</p>
            <BaseButton variant="outline" size="sm" @click="triggerFilePicker">Chọn tệp</BaseButton>
            <p class="upload-dropzone__hint">Hỗ trợ nhiều tệp cùng lúc</p>
          </div>

          <div v-if="hasSelection" class="upload-list">
            <div v-for="(file, index) in selectedFilesList" :key="`${file.name}-${index}`" class="upload-list__item">
              <div>
                <strong>{{ file.name }}</strong>
                <p class="upload-list__meta">{{ file.size }}</p>
              </div>
              <button class="upload-list__remove" type="button" @click="removeFile(index)">X</button>
            </div>
          </div>

          <footer class="upload-modal__footer">
            <BaseButton variant="outline" size="sm" @click="closeUploadModal">Đóng</BaseButton>
            <BaseButton :disabled="!hasSelection || isUploading" size="sm" @click="uploadAll">
              {{ isUploading ? 'Đang tải...' : `Tải lên (${selectedFiles.length || 0})` }}
            </BaseButton>
          </footer>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="detailItem" class="upload-modal">
        <div class="upload-modal__backdrop" @click="closeDetail"></div>
        <div class="upload-modal__content upload-modal__content--detail">
          <header class="upload-modal__header">
            <div>
              <p class="eyebrow">Chi tiết</p>
              <h3>{{ detailItem.name }}</h3>
              <p class="upload-detail__meta">
                {{ detailItem.uploadedByName }} · {{ detailItem.uploadedAtLabel || '—' }}
              </p>
            </div>
            <button class="upload-modal__close" type="button" @click="closeDetail">×</button>
          </header>

          <div class="upload-detail__body">
            <div class="upload-detail__preview">
              <img v-if="detailItem.previewUrl" :src="detailItem.previewUrl" alt="" />
              <div v-else class="upload-detail__placeholder">{{ (detailItem.displayType ?? '').charAt(0) }}</div>
            </div>
            <div class="upload-detail__info">
              <p><strong>Loại:</strong> {{ detailItem.displayType }}</p>
              <p><strong>Kích thước:</strong> {{ detailItem.displaySize }}</p>
              <p><strong>Định dạng:</strong> {{ detailItem.format ?? '—' }}</p>
              <p><strong>Kích thước ảnh:</strong> {{ detailItem.width && detailItem.height ? `${detailItem.width} x ${detailItem.height}px` : '—' }}</p>
              <p><strong>URL:</strong> <a :href="detailItem.previewUrl" target="_blank" rel="noreferrer">Mở trong tab mới</a></p>
              <div class="detail-actions">
                <BaseButton
                  size="sm"
                  variant="danger"
                  type="button"
                  :disabled="deletingId === detailItem.id"
                  @click="handleDelete(detailItem)"
                >
                  {{ deletingId === detailItem.id ? 'Đang xóa...' : 'Xóa tệp' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<style scoped>
.media {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.media__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.media__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.media__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media__filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.media__filter {
  border: 1px solid rgba(14, 165, 233, 0.25);
  background: transparent;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-weight: 500;
}

.media__filter.is-active {
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-hover);
  border-color: transparent;
}

.media__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.media__item {
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.media__item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.1);
}

.media__thumb {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: rgba(14, 165, 233, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.media__info h3 {
  margin: 0;
  font-size: 1rem;
}

.media__info p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.upload-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.upload-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
}

.upload-modal__content {
  position: relative;
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  width: min(720px, 92vw);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-modal__content--detail {
  width: min(960px, 94vw);
}

.upload-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-modal__close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.upload-dropzone {
  border: 2px dashed rgba(14, 165, 233, 0.4);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  background: rgba(14, 165, 233, 0.05);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-dropzone.is-active {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.12);
}

.upload-dropzone__hint {
  margin: 0.5rem 0;
  color: var(--text-muted);
}

.upload-list {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  max-height: 220px;
  overflow: auto;
}

.upload-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.upload-list__item:last-child {
  border-bottom: none;
}

.upload-list__meta {
  margin: 0.15rem 0 0;
  color: var(--text-muted);
}

.upload-list__remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-weight: 700;
}

.upload-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.upload-detail__body {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;
  align-items: start;
}

.upload-detail__preview {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  min-height: 320px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-detail__preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #0f172a;
}

.upload-detail__placeholder {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-muted);
}

.upload-detail__info p {
  margin: 0.35rem 0;
}

.upload-detail__meta {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
}

.detail-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}
</style>
