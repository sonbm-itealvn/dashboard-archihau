<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'

const route = useRoute()
const createMediaQuery = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }
  }
  return window.matchMedia('(max-width: 1024px)')
}

const mq = createMediaQuery()
const isSidebarOpen = ref(false)
const isMobile = ref(mq.matches)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleMediaChange = (event) => {
  isMobile.value = event.matches
  if (!event.matches) {
    // Reset to closed state when returning to desktop to avoid overlay flashes
    isSidebarOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    if (isMobile.value) {
      closeSidebar()
    }
  }
)

onMounted(() => {
  mq.addEventListener('change', handleMediaChange)
})

onBeforeUnmount(() => {
  mq.removeEventListener('change', handleMediaChange)
})

const showBackdrop = computed(() => isMobile.value && isSidebarOpen.value)
</script>

<template>
  <div class="layout">
    <Sidebar :is-open="isSidebarOpen" @close="closeSidebar" />
    <div class="layout__shell">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <main class="layout__content">
        <RouterView />
      </main>
      <Footer />
    </div>
    <div v-if="showBackdrop" class="layout__backdrop" @click="closeSidebar" />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  position: relative;
}

.layout__shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  margin-left: var(--sidebar-width);
  min-width: 0; /* Prevent flex child overflow */
  transition: margin-left var(--transition-normal);
}

.layout__content {
  flex: 1;
  padding: var(--content-padding);
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.layout__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 40;
}

@media (max-width: 1280px) {
  .layout__content {
    padding: var(--content-padding-sm);
  }
}

@media (max-width: 1024px) {
  .layout__shell {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .layout__content {
    padding: var(--content-padding-xs);
  }
}
</style>
