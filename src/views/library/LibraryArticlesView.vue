<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { RouterLink } from 'vue-router'

const sections = computed(() => [
  {
    title: 'Cuộc thi',
    description: 'Tạo bài viết giới thiệu, cập nhật tiến độ và công bố kết quả các cuộc thi.',
    cta: 'Tạo bài viết cuộc thi',
    to: { name: 'post-form', query: { topic: 'competition' } },
  },
  {
    title: 'Nghiên cứu khoa học',
    description: 'Đăng bài về đề tài, nhóm nghiên cứu, công bố và workshop khoa học.',
    cta: 'Tạo bài viết nghiên cứu',
    to: { name: 'post-form', query: { topic: 'research' } },
  },
  {
    title: 'Hoạt động & sự kiện học thuật',
    description: 'Chia sẻ thông tin seminar, talkshow, học bổng hoặc hoạt động hợp tác.',
    cta: 'Tạo bài viết hoạt động',
    to: { name: 'post-form', query: { topic: 'academic' } },
  },
])
</script>

<template>
  <section class="card library">
    <header class="library__header">
      <div>
        <p class="eyebrow">Thư viện bài viết</p>
        <h2>Tạo nội dung cho Kho học thuật</h2>
        <p class="lead">
          Tập trung đăng tải bài viết về cuộc thi, nghiên cứu khoa học, seminar và các hoạt động học thuật khác.
        </p>
      </div>
      <RouterLink :to="{ name: 'post-form' }">
        <BaseButton size="sm">Tạo bài viết mới</BaseButton>
      </RouterLink>
    </header>

    <div class="library__grid">
      <article v-for="section in sections" :key="section.title" class="library__item">
        <div>
          <p class="eyebrow eyebrow--muted">Chủ đề</p>
          <h3>{{ section.title }}</h3>
          <p class="description">{{ section.description }}</p>
        </div>
        <RouterLink :to="section.to">
          <BaseButton variant="outline" size="sm">{{ section.cta }}</BaseButton>
        </RouterLink>
      </article>
    </div>
  </section>
</template>

<style scoped>
.library {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.library__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.lead {
  color: var(--text-secondary);
  max-width: 640px;
}

.library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.library__item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}

.description {
  color: var(--text-secondary);
}

.eyebrow--muted {
  color: var(--text-muted);
}
</style>

