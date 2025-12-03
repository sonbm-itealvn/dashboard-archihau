import { ref } from 'vue'

const toasts = ref([])
let seed = 0

export function useToast() {
  const showToast = (message, variant = 'info', duration = 2500) => {
    const id = ++seed
    toasts.value.push({ id, message, variant })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  const dismiss = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, showToast, dismiss }
}
