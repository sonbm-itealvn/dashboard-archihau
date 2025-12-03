<script setup>
import { computed } from 'vue'
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
</script>

<template>
  <header class="navbar">
    <div class="navbar__left">
      <button class="menu-toggle" aria-label="Mở hoặc đóng menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Tìm kiếm bảng điều khiển, người dùng..." />
      </div>
    </div>

    <div class="navbar__right">
      <button class="icon-btn" aria-label="Trung tâm thông báo">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span class="badge-dot"></span>
      </button>
      <button class="icon-btn" aria-label="Tin nhắn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
      <BaseButton size="sm" variant="secondary">Tạo báo cáo</BaseButton>
      <div class="user-chip">
        <div class="user-meta">
          <span>Xin chào, {{ displayName }}</span>
          <small>{{ roleLabel }}</small>
        </div>
        <div class="user-avatar">{{ avatarInitial }}</div>
      </div>
      <BaseButton size="sm" variant="ghost" @click="logout">Đăng xuất</BaseButton>
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

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  background: var(--background-color);
  border: 1px solid var(--border-color);
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

@media (max-width: 1024px) {
  .menu-toggle {
    display: block;
  }
}
</style>
