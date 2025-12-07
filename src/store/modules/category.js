import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as categoryApi from '@/api/categoryApi'

const initialCategories = []

export const useCategoryStore = defineStore('category', () => {
  const categories = ref(initialCategories)

  async function fetchCategories() {
    const remote = await categoryApi.fetchCategories()
    categories.value = Array.isArray(remote) ? remote : []
  }

  async function deleteCategory(id) {
    await categoryApi.deleteCategory(id)
    categories.value = categories.value.filter((item) => item.id !== id)
  }

  return {
    categories,
    fetchCategories,
    deleteCategory,
  }
})
