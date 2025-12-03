<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMediaStore } from '@/store/modules/media'

const route = useRoute()
const router = useRouter()
const store = useMediaStore()

const typeLabels = {
  Image: 'Hình ảnh',
  Video: 'Video',
  Document: 'Tài liệu',
}

const item = computed(() => store.mediaItems.find((media) => String(media.id) === String(route.params.id)))

onMounted(() => {
  if (!item.value) {
    store.fetchMedia()
  }
})
</script>

<template>
  <section class="card detail">
    <h2>Chi tiết media</h2>
    <div v-if="item">
      <p><strong>Tên:</strong> {{ item.name }}</p>
      <p><strong>Định dạng:</strong> {{ typeLabels[item.type] ?? item.type }}</p>
      <p><strong>Dung lượng:</strong> {{ item.size }}</p>
    </div>
    <p v-else>Chưa có dữ liệu để hiển thị.</p>
    <BaseButton variant="secondary" @click="router.back()">Quay lại</BaseButton>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
