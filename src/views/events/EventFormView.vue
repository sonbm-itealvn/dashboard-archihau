<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { createEvent, updateEvent, fetchEventById } from '@/api/eventApi'

const route = useRoute()
const router = useRouter()
const form = reactive({
  name: '',
  title: '',
  location: '',
  startDate: '',
  startTime: '00:00',
  endDate: '',
  endTime: '00:00',
  start_time: '',
  end_time: '',
  content: '',
})

const isLoading = ref(false)
const formError = ref('')
const loadError = ref('')
const isSubmitting = ref(false)

const isEditing = computed(() => Boolean(route.params.id))

const goBack = () => {
  router.push({ name: 'event-list' })
}

const validateDates = () => {
  const start = new Date(form.start_time)
  const end = new Date(form.end_time)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    formError.value = 'Thời gian không hợp lệ. Vui lòng chọn ngày và giờ chính xác.'
    return false
  }
  if (end <= start) {
    formError.value = 'Thời gian kết thúc phải sau thời gian bắt đầu.'
    return false
  }
  return true
}

const buildIsoString = (date, time) => {
  if (!date) return ''
  const safeTime = time && time.length ? time : '00:00'
  return `${date}T${safeTime}`
}

const parseIso = (value) => {
  if (!value || typeof value !== 'string') {
    return { date: '', time: '00:00' }
  }
  const [datePart, timePart] = value.split('T')
  return {
    date: datePart ?? '',
    time: timePart ? timePart.slice(0, 5) : '00:00',
  }
}

const populateForm = (event) => {
  form.name = event.name ?? ''
  form.title = event.title ?? ''
  form.location = event.location ?? ''
  form.content = event.content ?? ''
  const start = parseIso(event.start_time)
  const end = parseIso(event.end_time)
  form.startDate = start.date
  form.startTime = start.time
  form.endDate = end.date
  form.endTime = end.time
  form.start_time = event.start_time ?? ''
  form.end_time = event.end_time ?? ''
}

const loadEvent = async () => {
  if (!isEditing.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    const event = await fetchEventById(route.params.id)
    populateForm(event)
  } catch (error) {
    loadError.value = error?.message ?? 'Không thể tải sự kiện.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEvent)

const handleSubmit = async () => {
  formError.value = ''
  if (!form.name.trim() || !form.title.trim() || !form.content.trim()) {
    formError.value = 'Vui lòng nhập đầy đủ tên, tiêu đề và nội dung sự kiện.'
    return
  }
  form.start_time = buildIsoString(form.startDate, form.startTime)
  form.end_time = buildIsoString(form.endDate, form.endTime)
  if (!form.start_time || !form.end_time || !validateDates()) {
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      name: form.name,
      start_time: form.start_time,
      end_time: form.end_time,
      title: form.title,
      content: form.content,
      location: form.location || null,
    }
    if (isEditing.value) {
      await updateEvent(route.params.id, payload)
    } else {
      await createEvent(payload)
    }
    router.push({ name: 'event-list' })
  } catch (error) {
    formError.value = error?.message ?? 'Không thể tạo sự kiện. Vui lòng thử lại.';
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="card form">
    <header class="form__header">
      <div>
        <p class="eyebrow">{{ isEditing ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới' }}</p>
        <h2>{{ isEditing ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện' }}</h2>
        <p>Nhập đầy đủ thông tin để lịch sự kiện luôn chính xác.</p>
      </div>
      <BaseButton variant="secondary" type="button" @click="goBack">Quay lại</BaseButton>
    </header>

    <div v-if="isLoading" class="form-state">Đang tải thông tin sự kiện...</div>
    <div v-else-if="loadError" class="form-state form-state--error">{{ loadError }}</div>

    <form v-else class="form__body" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="name">Tên sự kiện (name)</label>
        <input id="name" v-model="form.name" placeholder="Ví dụ: Họp phụ huynh toàn trường" required />
      </div>

      <div class="form-field">
        <label for="title">Tiêu đề hiển thị (title)</label>
        <input id="title" v-model="form.title" placeholder="Tiêu đề hiển thị trên giao diện" required />
      </div>

      <div class="form-field">
        <label for="location">Địa điểm</label>
        <input id="location" v-model="form.location" placeholder="Hội trường A1, cơ sở 1..." />
      </div>

      <div class="form__grid">
        <div class="form-field">
          <label>Thời gian bắt đầu</label>
          <div class="datetime-row">
            <input type="date" v-model="form.startDate" required />
            <input type="time" v-model="form.startTime" />
          </div>
        </div>
        <div class="form-field">
          <label>Thời gian kết thúc</label>
          <div class="datetime-row">
            <input type="date" v-model="form.endDate" required />
            <input type="time" v-model="form.endTime" />
          </div>
        </div>
      </div>

      <div class="form-field">
        <label for="content">Nội dung/chi tiết</label>
        <textarea id="content" v-model="form.content" rows="6" placeholder="Nội dung chi tiết của sự kiện..." />
      </div>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="goBack">Hủy</BaseButton>
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu sự kiện' }}
        </BaseButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-error {
  margin: 0;
  color: var(--danger-color);
  font-weight: 500;
}

.form-state {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
  text-align: center;
}

.form-state--error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger-color);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.datetime-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.datetime-row input[type='date'],
.datetime-row input[type='time'] {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
}

.datetime-row input[type='datetime-local']:focus,
.datetime-row input[type='date']:focus,
.datetime-row input[type='time']:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}
</style>
