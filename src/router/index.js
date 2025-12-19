import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardHome from '@/views/dashboard/DashboardHome.vue'
import UserListView from '@/views/users/UserListView.vue'
import UserDetailView from '@/views/users/UserDetailView.vue'
import UserFormView from '@/views/users/UserFormView.vue'
import PostListView from '@/views/posts/PostListView.vue'
import PostFormView from '@/views/posts/PostFormView.vue'
import CategoryListView from '@/views/categories/CategoryListView.vue'
import CategoryFormView from '@/views/categories/CategoryFormView.vue'
import CategoryDetailView from '@/views/categories/CategoryDetailView.vue'
import TagManagementView from '@/views/tags/TagManagementView.vue'
import MediaLibraryView from '@/views/media/MediaLibraryView.vue'
import MediaDetailView from '@/views/media/MediaDetailView.vue'
import LibraryArticlesView from '@/views/library/LibraryArticlesView.vue'
import EventListView from '@/views/events/EventListView.vue'
import EventFormView from '@/views/events/EventFormView.vue'
import EventDetailView from '@/views/events/EventDetailView.vue'
import BannerManagementView from '@/views/banners/BannerManagementView.vue'
import CategoryGroupListView from '@/views/category-groups/CategoryGroupListView.vue'
import CategoryGroupFormView from '@/views/category-groups/CategoryGroupFormView.vue'
import CategoryGroupDetailView from '@/views/category-groups/CategoryGroupDetailView.vue'
import AnnouncementListView from '@/views/announcements/AnnouncementListView.vue'
import AnnouncementFormView from '@/views/announcements/AnnouncementFormView.vue'
import tokenService from '@/services/tokenService'
import { useAuthStore } from '@/store/modules/auth'

const router = createRouter({
  // Use hash history to avoid server rewrite requirements on refresh.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { public: true } },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', name: 'dashboard-home', component: DashboardHome },
        { path: 'users', name: 'user-list', component: UserListView },
        { path: 'users/new', name: 'user-form', component: UserFormView },
        { path: 'users/:id', name: 'user-detail', component: UserDetailView },
        { path: 'users/:id/edit', name: 'user-edit', component: UserFormView },
        { path: 'posts', name: 'post-list', component: PostListView },
        { path: 'posts/new', name: 'post-form', component: PostFormView },
        { path: 'posts/:id/edit', name: 'post-edit', component: PostFormView },
        { path: 'categories', name: 'category-list', component: CategoryListView },
        { path: 'categories/new', name: 'category-form', component: CategoryFormView },
        { path: 'categories/:id', name: 'category-detail', component: CategoryDetailView },
        { path: 'categories/:id/edit', name: 'category-edit', component: CategoryFormView },
        { path: 'category-groups', name: 'category-group-list', component: CategoryGroupListView },
        { path: 'category-groups/new', name: 'category-group-form', component: CategoryGroupFormView },
        { path: 'category-groups/:id', name: 'category-group-detail', component: CategoryGroupDetailView },
        { path: 'category-groups/:id/edit', name: 'category-group-edit', component: CategoryGroupFormView },
        { path: 'tags', name: 'tag-list', component: TagManagementView },
        { path: 'banners', name: 'banner-list', component: BannerManagementView },
        { path: 'media', name: 'media-library', component: MediaLibraryView },
        { path: 'media/:id', name: 'media-detail', component: MediaDetailView },
        { path: 'library-articles', name: 'library-articles', component: LibraryArticlesView },
        { path: 'events', name: 'event-list', component: EventListView },
        { path: 'events/new', name: 'event-form', component: EventFormView },
        { path: 'events/:id', name: 'event-detail', component: EventDetailView },
        { path: 'events/:id/edit', name: 'event-edit', component: EventFormView },
        { path: 'announcements', name: 'announcement-list', component: AnnouncementListView },
        { path: 'announcements/new', name: 'announcement-form', component: AnnouncementFormView },
        { path: 'announcements/:id/edit', name: 'announcement-edit', component: AnnouncementFormView },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, from, next) => {
  const hasToken = tokenService.hasToken()
  const isPublic = Boolean(to.meta?.public)
  const authStore = useAuthStore()

  if (hasToken && !authStore.currentUser) {
    try {
      await authStore.fetchProfile()
    } catch {
      tokenService.clear()
      next({ name: 'login' })
      return
    }
  }

  if (!isPublic && !hasToken) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (hasToken && ['login', 'register'].includes(String(to.name))) {
    next({ name: 'dashboard-home' })
    return
  }

  next()
})

export default router
