import { ref } from 'vue'

export function usePagination(initialPage = 1, initialSize = 10) {
  const page = ref(initialPage)
  const pageSize = ref(initialSize)

  const next = () => {
    page.value += 1
  }

  const prev = () => {
    page.value = Math.max(1, page.value - 1)
  }

  const reset = () => {
    page.value = 1
  }

  return { page, pageSize, next, prev, reset }
}
