<script setup>
import AppTable from '@/components/common/AppTable.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const heroHighlights = [
  { label: 'Doanh thu hôm nay', value: '$4.52K', change: '+12% so với hôm qua' },
  { label: 'Người dùng trực tuyến', value: '1,248', change: '+5% thời gian thực' },
  { label: 'Tỉ lệ chuyển đổi', value: '4.2%', change: '+1.4% tuần này' },
]

const stats = [
  {
    label: 'Tổng doanh thu',
    value: '$112,450',
    trend: 18.3,
    type: 'primary',
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>',
  },
  {
    label: 'Người dùng hoạt động',
    value: '2,560',
    trend: 9.1,
    type: 'success',
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  },
  {
    label: 'Đơn hàng mới',
    value: '+1,284',
    trend: 15.2,
    type: 'warning',
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
  },
  {
    label: 'Yêu cầu hỗ trợ',
    value: '48 yêu cầu',
    trend: -4.8,
    type: 'danger',
    icon:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path></svg>',
  },
]

const columns = [
  { key: 'customer', label: 'Khách hàng' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'amount', label: 'Giá trị' },
  { key: 'date', label: 'Ngày' },
]

const recentRows = [
  {
    id: 1,
    customer: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    status: 'Thành công',
    amount: '$1,999.00',
    date: '20 Feb 2024',
  },
  {
    id: 2,
    customer: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    status: 'Đang xử lý',
    amount: '$239.00',
    date: '20 Feb 2024',
  },
  {
    id: 3,
    customer: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    status: 'Thất bại',
    amount: '$299.00',
    date: '20 Feb 2024',
  },
  {
    id: 4,
    customer: 'William Kim',
    email: 'will@email.com',
    status: 'Thành công',
    amount: '$99.00',
    date: '19 Feb 2024',
  },
  {
    id: 5,
    customer: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    status: 'Thành công',
    amount: '$39.00',
    date: '19 Feb 2024',
  },
]

const topChannels = [
  { id: 1, label: 'Website', value: 62 },
  { id: 2, label: 'Ứng dụng', value: 23 },
  { id: 3, label: 'Quảng cáo MXH', value: 15 },
]

const activities = [
  { id: 1, time: '09:24', title: 'Xuất bản bài viết mới', meta: 'Alex - Nhóm Tin tức', status: 'success' },
  { id: 2, time: '08:10', title: 'Tải lên 24 tệp media', meta: 'Mai cập nhật thư viện', status: 'info' },
  { id: 3, time: '07:45', title: 'Yêu cầu phê duyệt nội dung', meta: 'Roadmap Q2 chờ duyệt', status: 'warning' },
]

const revenueTrendPoints = '0,90 35,72 70,78 105,52 140,62 175,38 210,45 245,30';
</script>

<template>
  <div class="dashboard-home">
    <section class="hero-card card">
      <div class="hero-text">
        <p class="eyebrow">Báo cáo Bluewave</p>
        <h2>Chào mừng quay lại, Admin</h2>
        <p>
          Tất cả chỉ số kinh doanh, nội dung và tín hiệu người dùng được sắp xếp rõ ràng trên bảng điều khiển xanh biển.
        </p>
        <div class="hero-actions">
          <BaseButton size="sm">Tạo báo cáo</BaseButton>
          <BaseButton size="sm" variant="outline">Chia sẻ bảng</BaseButton>
        </div>
      </div>
      <div class="hero-metrics">
        <article v-for="metric in heroHighlights" :key="metric.label" class="hero-metric">
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.change }}</span>
        </article>
      </div>
    </section>

    <div class="stat-grid">
      <StatCard v-for="stat in stats" :key="stat.label" v-bind="stat">
        <template #icon>
          <span v-html="stat.icon"></span>
        </template>
      </StatCard>
    </div>

    <div class="grid-layout">
      <div class="main-content">
        <BaseCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-bold">Doanh thu & lưu lượng</h3>
                <p class="text-sm text-muted">Theo dõi hiệu suất 7 ngày gần nhất</p>
              </div>
              <BaseButton variant="ghost" size="sm">Tuần này</BaseButton>
            </div>
          </template>
          <div class="trend">
            <div class="trend__chart">
              <svg viewBox="0 0 250 110" class="trend-chart" aria-hidden="true">
                <polyline
                  :points="revenueTrendPoints"
                  stroke="var(--primary-color)"
                  fill="none"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></polyline>
              </svg>
            </div>
            <div class="channels">
              <div v-for="channel in topChannels" :key="channel.id" class="channel">
                <div class="channel__head">
                  <span>{{ channel.label }}</span>
                  <span>{{ channel.value }}%</span>
                </div>
                <div class="channel__bar">
                  <div class="channel__progress" :style="{ width: `${channel.value}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-bold">Giao dịch gần đây</h3>
                <p class="text-sm text-muted">265 đơn hàng trong tháng này</p>
              </div>
              <BaseButton variant="ghost" size="sm">Xem tất cả</BaseButton>
            </div>
          </template>

          <AppTable :columns="columns" :rows="recentRows">
            <template #cell-customer="{ row }">
              <div class="flex flex-col">
                <span class="font-medium">{{ row.customer }}</span>
                <span class="text-sm text-muted">{{ row.email }}</span>
              </div>
            </template>
            <template #cell-status="{ value }">
              <span
                class="badge"
                :class="{
                  'badge-success': value === 'Thành công',
                  'badge-warning': value === 'Đang xử lý',
                  'badge-danger': value === 'Thất bại'
                }"
              >{{ value }}</span>
            </template>
          </AppTable>
        </BaseCard>
      </div>
      <div class="side-content">
        <BaseCard>
          <template #header>
            <div>
              <h3 class="font-bold">Khách hàng nổi bật</h3>
              <p class="text-sm text-muted">Hiệu suất theo khu vực</p>
            </div>
          </template>
          <div class="sales-list">
            <div v-for="row in recentRows.slice(0, 4)" :key="row.id" class="sale-item">
              <div class="avatar">{{ row.customer.charAt(0) }}</div>
              <div class="sale-info">
                <p class="font-medium">{{ row.customer }}</p>
                <p class="text-sm text-muted">{{ row.email }}</p>
              </div>
              <div class="sale-amount font-bold">{{ row.amount }}</div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <h3 class="font-bold">Hoạt động gần đây</h3>
          </template>
          <div class="activity">
            <div v-for="item in activities" :key="item.id" class="activity__item">
              <span class="activity__time">{{ item.time }}</span>
              <div class="activity__content">
                <p class="activity__title">{{ item.title }}</p>
                <p class="activity__meta">{{ item.meta }}</p>
              </div>
              <span class="activity__dot" :class="`activity__dot--${item.status}`"></span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(13, 110, 253, 0.15));
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.hero-text h2 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 2vw, 2rem);
}

.hero-text p {
  margin: 0 0 1.25rem;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.hero-metric {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(14, 165, 233, 0.15);
}

.hero-metric p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hero-metric strong {
  display: block;
  font-size: 1.35rem;
  margin: 0.5rem 0 0.25rem;
}

.hero-metric span {
  font-size: 0.8rem;
  color: var(--primary-hover);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sale-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(14, 165, 233, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--primary-hover);
}

.sale-info p {
  margin: 0;
  line-height: 1.35;
}

.trend {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.trend__chart {
  width: 100%;
  height: 140px;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel__head {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 600;
}

.channel__bar {
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--background-color);
  margin-top: 0.5rem;
}

.channel__progress {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary-color), #38bdf8);
}

.activity {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity__item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.activity__time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.activity__title {
  margin: 0;
  font-weight: 600;
}

.activity__meta {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.activity__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.activity__dot--success {
  background: var(--success-color);
}

.activity__dot--info {
  background: var(--info-color);
}

.activity__dot--warning {
  background: var(--warning-color);
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-home {
    gap: 1.5rem;
  }

  .hero-card {
    grid-template-columns: 1fr;
    padding: 1.25rem;
  }

  .hero-actions {
    width: 100%;
  }

  .stat-grid {
    gap: 1rem;
  }

  .grid-layout {
    gap: 1rem;
  }

  .activity__item {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .activity__time {
    font-weight: 600;
  }
}
</style>
