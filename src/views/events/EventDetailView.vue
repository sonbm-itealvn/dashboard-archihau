<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { fetchEventById } from '@/api/eventApi'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const isLoading = ref(false)
const error = ref('')

const statusLabel = computed(() => {
  const status = computeStatus(event.value)
  switch (status) {
    case 'upcoming':
      return 'Sắp diễn ra'
    case 'live':
      return 'Đang diễn ra'
    case 'ended':
      return 'Đã kết thúc'
    default:
      return 'Không xác định'
  }
})

const statusClass = computed(() => `status-pill status-pill--${computeStatus(event.value)}`)

const computeStatus = (ev) => {
  if (!ev) return 'upcoming'
  const now = new Date()
  const start = new Date(ev.start_time)
  const end = new Date(ev.end_time)
  if (now < start) return 'upcoming'
  if (now >= start && now <= end) return 'live'
  return 'ended'
}

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

const goBack = () => {
  router.push({ name: 'event-list' })
}

const goEdit = () => {
  router.push({ name: 'event-edit', params: { id: route.params.id } })
}

const loadEvent = async () => {
  isLoading.value = true
  error.value = ''
  try {
    event.value = await fetchEventById(route.params.id)
  } catch (err) {
    error.value = err?.message ?? 'Không thể tải sự kiện.';
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEvent)
</script>

<template>
  <section class="card detail">
    <header class="detail__header">
      <div>
        <p class="eyebrow">Chi tiết sự kiện</p>
        <h2>{{ event?.title ?? event?.name ?? 'Sự kiện' }}</h2>
        <p class="detail__subtitle">{{ event?.name }}</p>
      </div>
      <div class="detail__actions">
        <BaseButton variant="secondary" size="sm" @click="goBack">Quay lại</BaseButton>
        <BaseButton size="sm" @click="goEdit">Chỉnh sửa</BaseButton>
      </div>
    </header>

    <div v-if="isLoading" class="detail__state">Đang tải thông tin...</div>
    <div v-else-if="error" class="detail__state detail__state--error">{{ error }}</div>

    <div v-else-if="event" class="detail__grid">
      <div>
        <span class="label">Trạng thái</span>
        <p><span :class="statusClass">{{ statusLabel }}</span></p>
      </div>
      <div>
        <span class="label">Địa điểm</span>
        <p>{{ event.location ?? '—' }}</p>
      </div>
      <div>
        <span class="label">Bắt đầu</span>
        <p>{{ formatTime(event.start_time) }}</p>
      </div>
      <div>
        <span class="label">Kết thúc</span>
        <p>{{ formatTime(event.end_time) }}</p>
      </div>
      <div class="detail__content">
        <span class="label">Nội dung</span>
        <p class="content-text">{{ event.content ?? 'Chưa có nội dung chi tiết.' }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail__actions {
  display: flex;
  gap: 0.5rem;
}

.detail__subtitle {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail__content {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.3rem;
}

.detail__state {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
  text-align: center;
}

.detail__state--error {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger-color);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.status-pill--upcoming {
  background: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
}

.status-pill--live {
  background: rgba(16, 185, 129, 0.2);
  color: #047857;
}

.status-pill--ended {
  background: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.content-text {
  margin: 0;
  white-space: pre-line;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
</style>
