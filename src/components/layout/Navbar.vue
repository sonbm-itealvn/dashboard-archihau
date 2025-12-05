<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'

const ROLE_LABELS = {
  manager: 'Quản lý',
  editor: 'Biên tập viên',
  contributor: 'Cộng tác viên',
  author: 'Tác giả',
  subscriber: 'Thành viên đăng ký',
}

const { currentUser, logout } = useAuth()
const isMenuOpen = ref(false)
const dropdownRef = ref(null)

const displayName = computed(() => {
  return currentUser.value?.full_name ?? currentUser.value?.name ?? 'Admin'
})

const roleLabel = computed(() => {
  if (Array.isArray(currentUser.value?.roles) && currentUser.value.roles.length) {
    const role = currentUser.value.roles[0]
    return ROLE_LABELS[role] ?? role
  }
  return 'Quản trị viên'
})

const avatarInitial = computed(() => {
  return displayName.value?.charAt(0)?.toUpperCase() ?? 'A'
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleCreateReport = () => {
  closeMenu()
}

const handleLogout = () => {
  closeMenu()
  logout()
}

const handleOutsideClick = (event) => {
  if (!dropdownRef.value) return
  const target = event.target
  if (target instanceof Node && !dropdownRef.value.contains(target)) {
    closeMenu()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <header class="navbar">
    <div class="navbar__left">
      <button class="menu-toggle" aria-label="Mở hoặc đóng menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Tìm kiếm bảng điều khiển, người dùng..." />
      </div>
    </div>

    <div class="navbar__right">
      <button class="icon-btn" aria-label="Trung tâm thông báo">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        <span class="badge-dot"></span>
      </button>
      <button class="icon-btn" aria-label="Tin nhắn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>
      <div class="user-menu" ref="dropdownRef">
        <button
          id="user-menu-trigger"
          class="user-chip"
          type="button"
          @click.stop="toggleMenu"
          aria-haspopup="true"
          :aria-expanded="String(isMenuOpen)"
          aria-controls="user-menu-dropdown"
        >
          <div class="user-avatar">{{ avatarInitial }}</div>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        <transition name="dropdown">
          <div
            v-if="isMenuOpen"
            id="user-menu-dropdown"
            class="dropdown-panel"
            role="menu"
            aria-labelledby="user-menu-trigger"
          >
            <div class="dropdown-header">
              <p class="dropdown-name">{{ displayName }}</p>
              <span class="dropdown-role">{{ roleLabel }}</span>
            </div>
            <div class="dropdown-actions">
              <BaseButton
                block
                size="sm"
                variant="secondary"
                class="dropdown-action"
                @click="handleCreateReport"
              >
                <template #icon-left>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </template>
                Tạo báo cáo
              </BaseButton>
              <button class="dropdown-link" type="button" @click="handleLogout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: var(--header-height);
  padding: 0 1.5rem;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.menu-toggle {
  display: none;
  padding: 0.5rem;
  color: var(--text-secondary);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  width: 100%;
  max-width: 400px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.search-bar:focus-within {
  background: var(--surface-color);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  color: var(--text-color);
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: inherit;
  font-size: 0.875rem;
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-secondary);
  position: relative;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background: var(--background-color);
  color: var(--text-color);
}

.badge-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: var(--danger-color);
  border-radius: 50%;
  border: 2px solid var(--surface-color);
}

.user-menu {
  position: relative;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: inherit;
}

.user-chip:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.user-chip:hover {
  border-color: var(--primary-color);
  background: rgba(14, 165, 233, 0.08);
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-meta span {
  font-size: 0.85rem;
  font-weight: 600;
}

.user-meta small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chevron-icon {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.user-chip[aria-expanded='true'] .chevron-icon {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 0.75rem);
  min-width: 240px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 50;
  transform-origin: top right;
}

.dropdown-panel::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 24px;
  width: 16px;
  height: 16px;
  background: var(--surface-color);
  transform: rotate(45deg);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

.dropdown-header {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-name {
  font-weight: 600;
  color: var(--text-color);
}

.dropdown-role {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.dropdown-action.btn) {
  justify-content: flex-start;
  gap: 0.4rem;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(14, 165, 233, 0.15);
}

:deep(.dropdown-action.btn svg) {
  stroke-width: 2.2;
}

.dropdown-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--danger-color);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.dropdown-link:hover {
  background: rgba(239, 68, 68, 0.08);
  transform: translateX(2px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (max-width: 1024px) {
  .menu-toggle {
    display: block;
  }
}
</style>
