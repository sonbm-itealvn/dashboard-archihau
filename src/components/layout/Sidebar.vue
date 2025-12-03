<script setup>
import { RouterLink } from 'vue-router'

const links = [
  {
    label: 'Tổng quan',
    to: { name: 'dashboard-home' },
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
  },
  {
    label: 'Người dùng',
    to: { name: 'user-list' },
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  {
    label: 'Bài viết',
    to: { name: 'post-list' },
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  },
  {
    label: 'Danh mục',
    to: { name: 'category-list' },
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>'
  },
  {
    label: 'Thư viện',
    to: { name: 'media-library' },
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <div class="logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        </div>
        <div class="logo-text">
          <span>BlueWave</span>
          <small>Bảng điều khiển</small>
        </div>
      </div>
      <span class="sidebar__badge">Trực tuyến</span>
    </div>

    <nav class="sidebar__nav">
      <div class="nav-section">
          <span class="nav-label">Điều hướng</span>
        <RouterLink
          v-for="link in links"
          :key="link.label"
          class="sidebar__link"
          active-class="is-active"
          :to="link.to"
        >
          <span class="link-icon" v-html="link.icon"></span>
          <span class="link-text">{{ link.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar__footer">
      <div class="user-profile">
        <div class="avatar">AD</div>
        <div class="user-info">
          <span class="name">Quản trị viên</span>
          <span class="role">Toàn quyền</span>
        </div>
      </div>
      <div class="sidebar__cta">
        <p>Hỗ trợ 24/7</p>
        <a href="mailto:support@hau.vn">support@hau.vn</a>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1.5rem;
}

.sidebar__header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: white;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-text span {
  font-weight: 700;
  font-size: 1rem;
}

.logo-text small {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
}

.sidebar__badge {
  padding: 0.15rem 0.65rem;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.sidebar__nav {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.75);
  transition: all var(--transition-fast);
  font-weight: 500;
  border: 1px solid transparent;
  backdrop-filter: blur(6px);
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar__link.is-active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.sidebar__cta {
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-align: left;
}

.sidebar__cta p {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.sidebar__cta a {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
