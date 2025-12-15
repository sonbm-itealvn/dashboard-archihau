import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as bannerApi from '@/api/bannerApi'

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return []
}

const toOrder = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

const toTimestamp = (value) => {
  const ts = new Date(value ?? 0).getTime()
  return Number.isFinite(ts) ? ts : 0
}

const sortBanners = (list) =>
  [...list].sort((a, b) => {
    const orderDiff = toOrder(a.display_order) - toOrder(b.display_order)
    if (orderDiff !== 0) return orderDiff
    return toTimestamp(b.created_at) - toTimestamp(a.created_at)
  })

export const useBannerStore = defineStore('banner', () => {
  const banners = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const setBanners = (payload) => {
    banners.value = sortBanners(normalizeList(payload))
  }

  const upsertBanner = (banner) => {
    if (!banner) return
    const list = [...banners.value]
    const idx = list.findIndex((item) => item.id === banner.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...banner }
    } else {
      list.push(banner)
    }
    banners.value = sortBanners(list)
  }

  async function fetchBanners(params) {
    error.value = ''
    isLoading.value = true
    try {
      const remote = await bannerApi.fetchBanners(params)
      setBanners(remote)
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải danh sách banner.'
      console.error('Failed to load banners', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBannerById(id) {
    try {
      const banner = await bannerApi.fetchBannerById(id)
      upsertBanner(banner)
      return banner
    } catch (err) {
      console.error('Failed to load banner detail', err)
      throw err
    }
  }

  async function createBanner(payload) {
    try {
      const created = await bannerApi.createBanner(payload)
      await fetchBanners()
      return created
    } catch (err) {
      console.error('Failed to create banner', err)
      throw err
    }
  }

  async function updateBanner(id, payload) {
    try {
      const updated = await bannerApi.updateBanner(id, payload)
      if (updated) {
        upsertBanner(updated)
      } else {
        await fetchBanners()
      }
      return updated
    } catch (err) {
      console.error('Failed to update banner', err)
      throw err
    }
  }

  async function deleteBanner(id) {
    try {
      await bannerApi.deleteBanner(id)
      banners.value = banners.value.filter((banner) => banner.id !== id)
    } catch (err) {
      console.error('Failed to delete banner', err)
      throw err
    }
  }

  async function toggleBannerActive(id, isActive) {
    return updateBanner(id, { is_active: isActive })
  }

  return {
    banners,
    isLoading,
    error,
    fetchBanners,
    fetchBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
  }
})

