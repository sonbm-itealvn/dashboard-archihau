import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as categoryGroupApi from '@/api/categoryGroupApi'

export const useCategoryGroupStore = defineStore('categoryGroup', () => {
  const categoryGroups = ref([])
  const isLoading = ref(false)
  const error = ref('')

  async function fetchCategoryGroups() {
    isLoading.value = true
    error.value = ''
    try {
      const remote = await categoryGroupApi.fetchCategoryGroups()
      categoryGroups.value = Array.isArray(remote) ? remote : []
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải danh sách nhóm danh mục.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoryGroupById(id) {
    isLoading.value = true
    error.value = ''
    try {
      return await categoryGroupApi.fetchCategoryGroupById(id)
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải thông tin nhóm danh mục.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createCategoryGroup(payload) {
    isLoading.value = true
    error.value = ''
    try {
      const created = await categoryGroupApi.createCategoryGroup(payload)
      categoryGroups.value = [created, ...categoryGroups.value]
      return created
    } catch (err) {
      error.value = err?.message ?? 'Không thể tạo nhóm danh mục.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCategoryGroup(id, payload) {
    isLoading.value = true
    error.value = ''
    try {
      const updated = await categoryGroupApi.updateCategoryGroup(id, payload)
      const index = categoryGroups.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        categoryGroups.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err?.message ?? 'Không thể cập nhật nhóm danh mục.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCategoryGroup(id) {
    isLoading.value = true
    error.value = ''
    try {
      await categoryGroupApi.deleteCategoryGroup(id)
      categoryGroups.value = categoryGroups.value.filter((item) => item.id !== id)
    } catch (err) {
      error.value = err?.message ?? 'Không thể xóa nhóm danh mục.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    categoryGroups,
    isLoading,
    error,
    fetchCategoryGroups,
    fetchCategoryGroupById,
    createCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
  }
})

