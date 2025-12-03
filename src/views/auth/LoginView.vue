<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()
const form = reactive({ email: '', password: '' })
const error = ref('')

const submit = async () => {
  error.value = ''
  try {
    await login(form)
  } catch (err) {
    error.value = err?.message ?? 'Không thể đăng nhập'
  }
}
</script>

<template>
  <section class="auth-screen">
    <div class="auth-illustration">
      <p class="eyebrow">HAU Bluewave</p>
      <h1>Chào mừng trở lại bảng điều khiển</h1>
      <p class="lead">
        Quản lý nội dung, theo dõi người dùng và KPI trên giao diện xanh biển giúp tập trung và dễ chịu hơn.
      </p>
      <ul class="auth-highlights">
        <li>
          <span class="dot"></span>
          <div>
            <strong>Chỉ số thời gian thực</strong>
            <p>Theo dõi doanh thu và người truy cập trên mọi kênh.</p>
          </div>
        </li>
        <li>
          <span class="dot"></span>
          <div>
            <strong>Cảnh báo thông minh</strong>
            <p>Nhận thông báo ngay khi có sự kiện quan trọng.</p>
      </div>
        </li>
      </ul>
    </div>
    <div class="auth-card card">
      <div class="auth-card__header">
        <h2>Đăng nhập</h2>
        <p>Nhập thông tin của bạn để truy cập bảng điều khiển.</p>
      </div>
      <form @submit.prevent="submit">
        <div class="form-field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="ban@example.com" required />
        </div>
        <div class="form-field">
          <label for="password">Mật khẩu</label>
          <input id="password" v-model="form.password" type="password" placeholder="********" required />
        </div>
        <p v-if="error" class="auth-error">{{ error }}</p>
        <BaseButton block type="submit">Đăng nhập</BaseButton>
      </form>
      <p class="auth-footnote">
        Chưa có tài khoản?
        <RouterLink to="/register">Đăng ký ngay</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-screen {
  min-height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: stretch;
  padding: 2rem;
  gap: 2rem;
}

.auth-illustration {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(29, 78, 216, 0.9));
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.35);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.auth-illustration h1 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  margin-bottom: 0.75rem;
}

.lead {
  color: rgba(255, 255, 255, 0.8);
  max-width: 520px;
}

.auth-highlights {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-highlights li {
  display: flex;
  gap: 0.85rem;
}

.auth-highlights strong {
  display: block;
  font-size: 1rem;
}

.auth-highlights p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.75);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.35rem;
  background: #fff;
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.25);
}

.auth-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2.5rem;
}

.auth-card__header h2 {
  margin: 0 0 0.35rem;
}

.auth-card__header p {
  margin: 0;
  color: var(--text-muted);
}

.auth-error {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
}

.auth-footnote {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
}

.auth-footnote a {
  color: var(--primary-color);
  font-weight: 600;
}

@media (max-width: 768px) {
  .auth-screen {
    padding: 1.5rem 1rem;
  }

  .auth-illustration {
    order: 2;
  }
}
</style>
