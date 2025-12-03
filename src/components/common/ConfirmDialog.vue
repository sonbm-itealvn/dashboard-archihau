<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận thao tác' },
  message: { type: String, default: 'Bạn có chắc chắn muốn tiếp tục?' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm">
      <div class="confirm__backdrop" @click="close" />
      <div class="confirm__panel">
        <h4>{{ title }}</h4>
        <p>{{ message }}</p>
        <div class="confirm__actions">
          <button type="button" @click="close">Hủy</button>
          <button type="button" class="danger" @click="confirm">Đồng ý</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.confirm__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
}

.confirm__panel {
  position: relative;
  background: #fff;
  border-radius: var(--radius-md);
  padding: 1.25rem;
  width: min(90vw, 360px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
}

.confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.confirm__actions button {
  border: none;
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.confirm__actions .danger {
  background: var(--danger-color);
  color: #fff;
}
</style>
