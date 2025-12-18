# Hướng dẫn xử lý Access Token và Refresh Token ở Frontend

## 1. Lưu trữ Token

### ✅ Nên dùng: `localStorage` hoặc `sessionStorage`
- **localStorage**: Token vẫn còn khi đóng trình duyệt (phù hợp cho "Remember me")
- **sessionStorage**: Token mất khi đóng tab (bảo mật hơn)

### ❌ Không nên: Lưu trong memory hoặc state (mất khi refresh page)

```javascript
// Lưu token
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// Lấy token
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');

// Xóa token
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

## 2. Cấu trúc API Client với Axios

### Setup Axios Interceptor

```javascript
// api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động thêm access token vào header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý token hết hạn và tự động refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // Không có refresh token, logout
        processQueue(error, null);
        logout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Lưu token mới
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        // Cập nhật header và retry request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Xử lý queue
        processQueue(null, access_token);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token hết hạn hoặc invalid
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Logout function
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Redirect to login page
  window.location.href = '/login';
};

export default apiClient;
```

## 3. Auth Service (React Example)

```javascript
// services/authService.js
import apiClient from './api/client';

export const authService = {
  // Login
  async login(identifier, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      });

      const { access_token, refresh_token, user } = response.data;

      // Lưu token
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return { user, access_token, refresh_token };
    } catch (error) {
      throw error;
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);

      const { access_token, refresh_token, user } = response.data;

      // Lưu token
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      return { user, access_token, refresh_token };
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Có thể gọi API logout nếu backend có endpoint
    // await apiClient.post('/auth/logout');
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Get access token
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },
};
```

## 4. React Hook Example (useAuth)

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi app load
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid, logout
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const { user } = await authService.login(identifier, password);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const { user } = await authService.register(userData);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 5. Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRoles.length > 0) {
    const hasRole = user?.roles?.some((role) =>
      requiredRoles.includes(role.toLowerCase())
    );
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
```

## 6. Sử dụng trong App

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['manager']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## 7. Best Practices

### ✅ DO:
1. **Lưu token trong localStorage/sessionStorage**
2. **Tự động refresh token khi hết hạn**
3. **Queue requests khi đang refresh**
4. **Clear token khi logout**
5. **Kiểm tra token khi app khởi động**
6. **Xử lý lỗi 401 một cách graceful**

### ❌ DON'T:
1. **Không lưu token trong state (mất khi refresh)**
2. **Không gửi refresh token trong mọi request**
3. **Không để nhiều refresh requests cùng lúc**
4. **Không bỏ qua lỗi 401**
5. **Không hardcode token trong code**

## 8. Xử lý Token Expiry (Proactive Refresh)

```javascript
// utils/tokenManager.js
import apiClient from './api/client';

// Kiểm tra và refresh token trước khi hết hạn
export const setupTokenRefresh = () => {
  const checkAndRefresh = async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) return;

    try {
      // Decode token để kiểm tra expiry (không verify, chỉ decode)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresIn = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresIn - now;

      // Nếu còn < 5 phút thì refresh
      if (timeUntilExpiry < 5 * 60 * 1000) {
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };

  // Kiểm tra mỗi 1 phút
  setInterval(checkAndRefresh, 60 * 1000);
  
  // Kiểm tra ngay khi load
  checkAndRefresh();
};
```

## 9. Vue.js Example (Composition API)

```javascript
// composables/useAuth.js
import { ref, computed } from 'vue';
import apiClient from '@/api/client';

export const useAuth = () => {
  const user = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!localStorage.getItem('access_token'));

  const login = async (identifier, password) => {
    loading.value = true;
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      });

      const { access_token, refresh_token, user: userData } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      user.value = userData;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    user.value = null;
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
```

## 10. Tóm tắt Flow

```
1. User Login
   ↓
2. Lưu access_token (30m) và refresh_token (1d) vào localStorage
   ↓
3. Mỗi request tự động thêm: Authorization: Bearer <access_token>
   ↓
4. Nếu access_token hết hạn (401):
   - Tự động gọi /auth/refresh với refresh_token
   - Lưu token mới
   - Retry request ban đầu
   ↓
5. Nếu refresh_token hết hạn:
   - Logout user
   - Redirect to login
```

## 11. Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:3000
# hoặc
VITE_API_URL=http://localhost:3000
```

---

**Lưu ý**: Code này là template, bạn cần điều chỉnh theo framework và thư viện bạn đang sử dụng (React, Vue, Angular, etc.)

