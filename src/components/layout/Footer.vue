<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <small>&copy; {{ year }} HAU Dashboard - Giao diện Bluewave.</small>
  </footer>
</template>

<style scoped>
.footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.9);
}
</style>
