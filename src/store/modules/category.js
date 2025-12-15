import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as categoryApi from '@/api/categoryApi'

const initialCategories = [
  { id: 1, name: 'News', description: 'Company announcements' },
  { id: 2, name: 'Guides', description: 'How-to articles' },
]

export const useCategoryStore = defineStore('category', () => {
  const categories = ref(initialCategories)

  async function fetchCategories() {
    try {
      const remote = await categoryApi.fetchCategories()
      categories.value = Array.isArray(remote) ? remote : []
    } catch (err) {
      console.error('Failed to fetch categories', err)
    }
  }

  async function deleteCategory(id) {
    try {
      await categoryApi.deleteCategory(id)
      categories.value = categories.value.filter((category) => category.id !== id)
    } catch (err) {
      console.error('Failed to delete category', err)
      throw err
    }
  }

  return {
    categories,
    fetchCategories,
    deleteCategory,
  }
})
