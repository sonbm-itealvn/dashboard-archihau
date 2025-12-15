import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as mediaApi from '@/api/mediaApi'

const initialMedia = [
  { id: 1, name: 'Hero banner', type: 'Image', size: '1.2 MB' },
  { id: 2, name: 'Product demo', type: 'Video', size: '85 MB' },
]

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '—'
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / 1024 ** i
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`
}

const mapResourceType = (resourceType) => {
  const rt = (resourceType ?? '').toLowerCase()
  if (rt === 'image') return 'Image'
  if (rt === 'video') return 'Video'
  if (rt === 'raw') return 'Document'
  return 'Document'
}

const normalizeMediaItem = (item) => {
  const id = item?.id ?? item?.public_id ?? item?._id ?? `${Date.now()}-${Math.random()}`
  return {
    id,
    name: item?.name ?? item?.original_filename ?? item?.filename ?? item?.public_id ?? 'Tệp',
    type: item?.type ?? mapResourceType(item?.resource_type),
    size: item?.size ?? (typeof item?.bytes === 'number' ? formatBytes(item.bytes) : '—'),
    url: item?.url ?? item?.secure_url ?? item?.path ?? '',
    width: item?.width,
    height: item?.height,
    format: item?.format,
    resourceType: item?.resource_type ?? item?.type ?? 'auto',
    publicId: item?.public_id ?? '',
    uploadedAt: item?.created_at ?? null,
    uploadedBy: item?.uploaded_by ?? null,
    raw: item,
  }
}

const buildFormData = ({ file, folder, resourceType }) => {
  const formData = new FormData()
  formData.append('file', file)
  if (folder) formData.append('folder', folder)
  if (resourceType) formData.append('resource_type', resourceType)
  return formData
}

export const useMediaStore = defineStore('media', () => {
  const mediaItems = ref(initialMedia.map(normalizeMediaItem))
  const isUploading = ref(false)
  const uploadError = ref('')

  async function fetchMedia() {
    const remote = await mediaApi.fetchMedia()
    if (Array.isArray(remote) && remote.length) {
      mediaItems.value = remote.map(normalizeMediaItem)
    }
  }

  async function uploadMedia({ file, folder, resourceType } = {}) {
    if (!file) {
      throw new Error('Vui lòng chọn tệp để tải lên.')
    }
    uploadError.value = ''
    isUploading.value = true
    try {
      const created = await mediaApi.uploadMedia(buildFormData({ file, folder, resourceType }))
      const normalized = normalizeMediaItem(created)
      mediaItems.value = [normalized, ...mediaItems.value]
      return normalized
    } catch (err) {
      uploadError.value = err?.message ?? 'Tải tệp thất bại.'
      throw err
    } finally {
      isUploading.value = false
    }
  }

  async function uploadMediaBatch(files = [], options = {}) {
    if (!files.length) {
      throw new Error('Vui lòng chọn ít nhất một tệp.')
    }
    uploadError.value = ''
    isUploading.value = true
    const successes = []
    const failures = []

    try {
      for (const file of files) {
        try {
          const created = await mediaApi.uploadMedia(buildFormData({ file, ...options }))
          const normalized = normalizeMediaItem(created)
          successes.push(normalized)
        } catch (err) {
          failures.push({ file, error: err })
        }
      }
      if (successes.length) {
        mediaItems.value = [...successes, ...mediaItems.value]
      }
      if (failures.length) {
        uploadError.value = failures[0]?.error?.message ?? 'Một số tệp tải lên thất bại.'
      }
      return { successes, failures }
    } finally {
      isUploading.value = false
    }
  }

  async function deleteMedia(id) {
    if (!id) throw new Error('Thiếu id media để xóa.')
    try {
      await mediaApi.deleteMedia(id)
      mediaItems.value = mediaItems.value.filter((item) => item.id !== id)
    } catch (err) {
      console.error('Failed to delete media', err)
      throw err
    }
  }

  return {
    mediaItems,
    isUploading,
    uploadError,
    fetchMedia,
    uploadMedia,
    uploadMediaBatch,
    deleteMedia,
  }
})
