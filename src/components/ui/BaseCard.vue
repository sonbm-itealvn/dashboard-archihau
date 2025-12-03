<template>
  <div class="card">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}
</style>
