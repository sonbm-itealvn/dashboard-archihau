<script setup>
const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  emptyMessage: { type: String, default: 'Không có dữ liệu để hiển thị' },
})
</script>

<template>
  <div class="app-table-container">
    <table class="app-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="column.class">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row[rowKey] ?? row.id">
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.class"
            :data-label="column.label"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!rows.length" class="app-table__empty">
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.app-table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(14, 165, 233, 0.15);
  background: var(--surface-color);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.04);
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.app-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  background: rgba(14, 165, 233, 0.08);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
}

.app-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  vertical-align: middle;
  font-size: 0.9rem;
}

.app-table th.text-right,
.app-table td.text-right {
  text-align: right;
}

.app-table tr:last-child td {
  border-bottom: none;
}

.app-table tbody tr {
  transition: background-color var(--transition-fast);
}

.app-table tbody tr:hover {
  background-color: rgba(14, 165, 233, 0.05);
}

.app-table__empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .app-table thead {
    display: none;
  }

  .app-table tbody tr {
    display: block;
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 0;
  }

  .app-table td {
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
  }

  .app-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .app-table-container {
    border-radius: var(--radius-md);
  }
}
</style>
