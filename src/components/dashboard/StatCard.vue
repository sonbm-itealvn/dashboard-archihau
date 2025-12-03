<template>
  <div class="stat-card">
    <div class="stat-icon" :class="type">
      <slot name="icon"></slot>
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div v-if="trend" class="stat-trend" :class="trend > 0 ? 'positive' : 'negative'">
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
        <span class="trend-label">so với tháng trước</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: String,
  value: [String, Number],
  type: {
    type: String,
    default: 'primary'
  },
  trend: Number
})
</script>

<style scoped>
.stat-card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid rgba(14, 165, 233, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.04);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(14, 165, 233, 0.1);
}

.stat-icon.primary { color: var(--primary-color); }
.stat-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success-color); }
.stat-icon.warning { background: rgba(251, 191, 36, 0.15); color: var(--warning-color); }
.stat-icon.danger { background: rgba(239, 68, 68, 0.15); color: var(--danger-color); }

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

.stat-trend {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary-hover);
}

.stat-trend.positive { color: var(--success-color); }
.stat-trend.negative { color: var(--danger-color); }

.trend-label {
  color: var(--text-muted);
  font-weight: 400;
}
</style>
