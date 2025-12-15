<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppSearchBar from '@/components/common/AppSearchBar.vue'
import { useBannerStore } from '@/store/modules/banner'
import { useMediaStore } from '@/store/modules/media'

const store = useBannerStore()
const mediaStore = useMediaStore()

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bật' },
  { value: 'inactive', label: 'Đang tắt' },
]

const keyword = ref('')
const activeFilter = ref('all')
const editingBannerId = ref(null)
const isSubmitting = ref(false)
const formError = ref('')
const actionError = ref('')
const deletingId = ref(null)
const togglingId = ref(null)
const bannerInputRef = ref(null)
const bannerError = ref('')
const isUploadingBanner = computed(() => mediaStore.isUploading)

const form = reactive({
  title: '',
  image_url: '',
  link_url: '',
  description: '',
  display_order: '',
  is_active: true,
})

const bannerStats = computed(() => {
  const total = store.banners.length
  const active = store.banners.filter((item) => item.is_active).length
  return {
    total,
    active,
    inactive: total - active,
  }
})

const handleSearch = (value) => {
  keyword.value = value ?? ''
}

const resetForm = () => {
  form.title = ''
  form.image_url = ''
  form.link_url = ''
  form.description = ''
  form.display_order = ''
  form.is_active = true
  formError.value = ''
  bannerError.value = ''
}

const populateForm = (banner) => {
  if (!banner) return
  form.title = banner.title ?? ''
  form.image_url = banner.image_url ?? ''
  form.link_url = banner.link_url ?? ''
  form.description = banner.description ?? ''
  form.display_order = banner.display_order ?? ''
  form.is_active = Boolean(banner.is_active)
  formError.value = ''
}

const startCreate = () => {
  editingBannerId.value = null
  resetForm()
}

const startEdit = async (banner) => {
  editingBannerId.value = banner.id
  try {
    const detail = await store.fetchBannerById(banner.id)
    populateForm(detail ?? banner)
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể tải chi tiết banner.'
    populateForm(banner)
  }
}

watch(
  activeFilter,
  (value) => {
    const params = value === 'all' ? undefined : { active: value === 'active' }
    store.fetchBanners(params)
  },
  { immediate: true },
)

const triggerBannerPicker = () => {
  bannerInputRef.value?.click()
}

const handleBannerFileChange = async (event) => {
  const [file] = event.target.files ?? []
  event.target.value = ''
  if (!file) return
  bannerError.value = ''
  try {
    const uploaded = await mediaStore.uploadMedia({ file, resourceType: 'image' })
    form.image_url = uploaded?.url ?? ''
  } catch (error) {
    bannerError.value = error?.message ?? 'Tải ảnh thất bại.'
  }
}

const filteredBanners = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const filter = activeFilter.value
  return store.banners.filter((banner) => {
    const matchStatus =
      filter === 'all' ? true : filter === 'active' ? banner.is_active : !banner.is_active
    if (!matchStatus) return false
    if (!query) return true
    const haystack = `${banner.title ?? ''} ${banner.description ?? ''} ${banner.link_url ?? ''}`.toLowerCase()
    return haystack.includes(query)
  })
})

const parseDisplayOrder = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const handleSubmit = async () => {
  formError.value = ''
  actionError.value = ''
  const title = form.title.trim()
  const imageUrl = form.image_url.trim()

  if (!title) {
    formError.value = 'Vui lòng nhập tiêu đề banner.'
    return
  }

  if (!imageUrl) {
    formError.value = 'Vui lòng nhập URL hình ảnh banner.'
    return
  }

  const payload = {
    title,
    image_url: imageUrl,
    link_url: form.link_url.trim() || null,
    description: form.description.trim() || null,
    display_order: parseDisplayOrder(form.display_order),
    is_active: Boolean(form.is_active),
  }

  isSubmitting.value = true
  try {
    if (editingBannerId.value) {
      await store.updateBanner(editingBannerId.value, payload)
    } else {
      await store.createBanner(payload)
    }
    startCreate()
  } catch (error) {
    formError.value = error?.message ?? 'Không thể lưu banner. Vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (banner) => {
  actionError.value = ''
  if (!window.confirm(`Bạn có chắc muốn xoá banner "${banner.title}"?`)) {
    return
  }
  deletingId.value = banner.id
  try {
    await store.deleteBanner(banner.id)
    if (editingBannerId.value === banner.id) {
      startCreate()
    }
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể xoá banner. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}

const handleToggleActive = async (banner) => {
  actionError.value = ''
  togglingId.value = banner.id
  try {
    await store.toggleBannerActive(banner.id, !banner.is_active)
  } catch (error) {
    actionError.value = error?.message ?? 'Không thể cập nhật trạng thái banner.'
  } finally {
    togglingId.value = null
  }
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
</script>

<template>
  <section class="card page">
    <header class="page__header">
      <div>
        <p class="eyebrow">Landing page</p>
        <h2>Quản lý banner</h2>
        <p>Thêm, sắp xếp thứ tự hiển thị và bật/tắt banner cho trang chủ.</p>
      </div>
      <div class="page__actions">
        <div class="page__search">
          <AppSearchBar placeholder="Tìm banner..." @search="handleSearch" />
        </div>
        <BaseButton v-if="editingBannerId" variant="secondary" type="button" @click="startCreate">
          Thêm banner mới
        </BaseButton>
      </div>
    </header>

    <div class="stats">
      <div class="stat-pill">
        <span class="label">Tổng</span>
        <strong>{{ bannerStats.total }}</strong>
      </div>
      <div class="stat-pill stat-pill--success">
        <span class="label">Đang bật</span>
        <strong>{{ bannerStats.active }}</strong>
      </div>
      <div class="stat-pill stat-pill--muted">
        <span class="label">Đang tắt</span>
        <strong>{{ bannerStats.inactive }}</strong>
      </div>
    </div>

    <div class="filters">
      <button
        v-for="filter in FILTERS"
        :key="filter.value"
        type="button"
        class="filter-chip"
        :class="{ 'filter-chip--active': activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <p v-if="store.error" class="alert alert--error">{{ store.error }}</p>

    <div class="layout">
      <div class="panel">
        <div class="panel__header">
          <div>
            <h3>Danh sách banner</h3>
            <p class="muted-text">Sắp xếp theo thứ tự hiển thị (ASC) và thời gian tạo (DESC).</p>
          </div>
        </div>

        <div v-if="store.isLoading" class="panel__state">Đang tải danh sách banner...</div>
        <div v-else-if="!filteredBanners.length" class="panel__state">Chưa có banner nào phù hợp.</div>
        <div v-else class="banner-table">
          <div class="banner-table__header">
            <span>Banner</span>
            <span>Thứ tự</span>
            <span>Trạng thái</span>
            <span class="text-right">Thao tác</span>
          </div>

          <div v-for="banner in filteredBanners" :key="banner.id" class="banner-row">
            <div class="cell cell--main">
              <div class="thumb" :style="{ backgroundImage: `url(${banner.image_url})` }" role="presentation" />
              <div class="info">
                <p class="title">{{ banner.title }}</p>
                <p class="description">{{ banner.description || 'Chưa có mô tả.' }}</p>
                <div class="meta">
                  <span v-if="banner.link_url" class="pill pill--outline">
                    Link: {{ banner.link_url }}
                  </span>
                  <span class="pill">Tạo lúc {{ formatDateTime(banner.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="cell">
              <p class="order">#{{ banner.display_order ?? '—' }}</p>
            </div>

            <div class="cell">
              <span class="status" :class="banner.is_active ? 'status--active' : 'status--inactive'">
                {{ banner.is_active ? 'Đang hiển thị' : 'Đang tắt' }}
              </span>
            </div>

            <div class="cell text-right actions">
              <BaseButton
                size="sm"
                variant="outline"
                type="button"
                :disabled="togglingId === banner.id"
                @click="handleToggleActive(banner)"
              >
                {{ togglingId === banner.id ? 'Đang cập nhật...' : banner.is_active ? 'Tắt hiển thị' : 'Bật hiển thị' }}
              </BaseButton>
              <BaseButton size="sm" variant="ghost" type="button" @click="startEdit(banner)">Chỉnh sửa</BaseButton>
              <BaseButton
                size="sm"
                variant="danger"
                type="button"
                :disabled="deletingId === banner.id"
                @click="handleDelete(banner)"
              >
                {{ deletingId === banner.id ? 'Đang xoá...' : 'Xoá' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div class="panel panel--form">
        <h3>{{ editingBannerId ? 'Chỉnh sửa banner' : 'Thêm banner mới' }}</h3>
        <p class="muted-text">
          {{
            editingBannerId
              ? 'Cập nhật nội dung, link, thứ tự và trạng thái hiển thị banner.'
              : 'Điền thông tin banner để xuất hiện trên trang landing page.'
          }}
        </p>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-field">
            <label for="banner-title">Tiêu đề *</label>
            <input id="banner-title" v-model="form.title" placeholder="Banner ưu đãi nhập học..." />
          </div>

          <div class="form-field">
            <label for="banner-image">Ảnh banner (URL) *</label>
            <input id="banner-image" v-model="form.image_url" placeholder="https://cdn.example.com/banner.jpg" />
            <div class="banner-actions">
              <input
                ref="bannerInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleBannerFileChange"
              />
              <BaseButton
                variant="outline"
                type="button"
                size="sm"
                :disabled="isUploadingBanner"
                @click="triggerBannerPicker"
              >
                {{ isUploadingBanner ? 'Đang tải...' : 'Chọn ảnh từ máy' }}
              </BaseButton>
              <button v-if="form.image_url" type="button" class="banner-clear" @click="form.image_url = ''">Xóa ảnh</button>
            </div>
            <p class="form-hint">Nhập URL sẵn có hoặc chọn ảnh từ máy (Cloudinary sẽ tự tải nếu cấu hình).</p>
            <p v-if="bannerError" class="form-hint form-hint--error">{{ bannerError }}</p>
            <div v-if="form.image_url" class="preview">
              <img :src="form.image_url" alt="Xem trước banner" />
            </div>
          </div>

          <div class="form-field">
            <label for="banner-link">Link chuyển hướng</label>
            <input id="banner-link" v-model="form.link_url" placeholder="https://hau.edu.vn/tin-tuc" />
          </div>

          <div class="form-field">
            <label for="banner-order">Thứ tự hiển thị</label>
            <input id="banner-order" v-model="form.display_order" type="number" min="0" step="1" />
            <p class="form-hint">Số nhỏ sẽ hiển thị trước. Bỏ trống để xếp cuối.</p>
          </div>

          <div class="form-field">
            <label for="banner-description">Mô tả</label>
            <textarea
              id="banner-description"
              v-model="form.description"
              rows="4"
              placeholder="Mô tả ngắn về nội dung banner..."
            ></textarea>
          </div>

          <div class="form-field form-field--inline">
            <label for="banner-active">Hiển thị trên landing page</label>
            <input id="banner-active" v-model="form.is_active" type="checkbox" />
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <div class="form-actions">
            <BaseButton variant="secondary" type="button" @click="startCreate">Huỷ</BaseButton>
            <BaseButton type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang lưu...' : editingBannerId ? 'Cập nhật banner' : 'Thêm banner' }}
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
  gap: 1.25rem;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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
  min-width: 240px;
  flex: 1;
  max-width: 360px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-pill {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: #fff;
  border: 1px solid var(--border-color);
  min-width: 140px;
}

.stat-pill--success {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.08);
}

.stat-pill--muted {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.08);
}

.stat-pill .label {
  display: block;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.1rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.9rem;
  background: #fff;
  color: var(--text-color);
  font-size: 0.85rem;
  transition: all var(--transition-fast);
}

.filter-chip--active {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(14, 165, 233, 0.12);
  font-weight: 600;
}

.layout {
  display: grid;
  grid-template-columns: minmax(360px, 2fr) minmax(300px, 1.2fr);
  gap: 1.25rem;
}

.panel {
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: var(--radius-lg);
  background: #fff;
  padding: 1.25rem;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel__header h3 {
  margin: 0;
}

.panel__state {
  padding: 1rem;
  text-align: center;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
}

.banner-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.banner-table__header,
.banner-row {
  display: grid;
  grid-template-columns: 2fr 120px 140px 220px;
  gap: 0.75rem;
  align-items: center;
}

.banner-table__header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3b4a5a;
}

.banner-row {
  padding: 0.85rem 0.5rem;
  border: 1px solid rgba(219, 234, 254, 0.8);
  border-radius: var(--radius-md);
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell--main {
  gap: 0.75rem;
}

.thumb {
  width: 86px;
  height: 56px;
  border-radius: var(--radius-md);
  background-size: cover;
  background-position: center;
  background-color: #e5e7eb;
  border: 1px solid var(--border-color);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.description {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(14, 165, 233, 0.12);
  color: #0f6ddf;
  font-size: 0.82rem;
  font-weight: 600;
}

.pill--outline {
  background: rgba(15, 23, 42, 0.04);
  color: #1f2937;
}

.order {
  margin: 0;
  font-weight: 700;
}

.status {
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.85rem;
}

.status--active {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.status--inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.actions {
  gap: 0.35rem;
  justify-content: flex-end;
}

.text-right {
  justify-content: flex-end;
}

.panel--form {
  position: sticky;
  top: 1rem;
  align-self: flex-start;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field input,
.form-field textarea {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
}

.form-field--inline {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.form-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.preview {
  margin-top: 0.5rem;
  max-width: 320px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.35rem;
}

.preview img {
  width: 100%;
  display: block;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.banner-clear {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-weight: 600;
  padding: 0.35rem 0.5rem;
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

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .panel--form {
    position: static;
  }

  .banner-table__header,
  .banner-row {
    grid-template-columns: 1fr;
  }

  .text-right,
  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .page__actions {
    justify-content: stretch;
  }
}
</style>

