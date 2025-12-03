<script setup>
import { RouterView } from 'vue-router'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
import Footer from './Footer.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <div class="layout__shell">
      <Navbar />
      <main class="layout__content">
        <RouterView />
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
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
  padding: 2rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .layout__shell {
    margin-left: 0;
  }
}
</style>
