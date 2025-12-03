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
    const remote = await categoryApi.fetchCategories()
    if (Array.isArray(remote) && remote.length) {
      categories.value = remote
    }
  }

  return {
    categories,
    fetchCategories,
  }
})
