import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as eventApi from '@/api/eventApi'

const initialEvents = [
  {
    id: 1,
    title: 'Hội thảo AI cho Kiến trúc',
    start_time: '2025-12-05T08:00:00+07:00',
    end_time: '2025-12-05T12:00:00+07:00',
    location: 'Hội trường A1',
    description: 'Thảo luận xu hướng AI trong thiết kế đô thị.',
  },
  {
    id: 2,
    title: 'Ngày hội Tân sinh viên',
    start_time: '2025-12-10T09:00:00+07:00',
    end_time: '2025-12-10T16:00:00+07:00',
    location: 'Sân trường HAU',
    description: 'Chào đón và định hướng cho K65.',
  },
  {
    id: 3,
    title: 'Triển lãm đồ án tốt nghiệp',
    start_time: '2025-11-20T08:00:00+07:00',
    end_time: '2025-11-25T17:00:00+07:00',
    location: 'Nhà đa năng',
    description: 'Trưng bày đồ án xuất sắc của sinh viên.',
  },
]

export const useEventStore = defineStore('event', () => {
  const events = ref(initialEvents)
  const isLoading = ref(false)
  const error = ref('')

  async function fetchEvents() {
    error.value = ''
    isLoading.value = true
    try {
      const remote = await eventApi.fetchEvents()
      if (Array.isArray(remote) && remote.length) {
        events.value = remote
      }
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải danh sách sự kiện.';
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    events,
    isLoading,
    error,
    fetchEvents,
  }
})
