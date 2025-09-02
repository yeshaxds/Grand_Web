<template>
  <!-- 登录弹窗遮罩 -->
  <div 
    class="login-modal-overlay" 
    v-show="authStore.showLoginModal" 
    @click="handleOverlayClick"
  >
    <!-- 登录弹窗内容 -->
    <div class="login-modal" @click.stop>
      <!-- 弹窗标题 -->
      <div class="login-header">
        <h3>用户登录</h3>
        <button class="close-btn" @click="authStore.closeLoginModal">
          <span>✕</span>
        </button>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名:</label>
          <input 
            id="username"
            type="text" 
            v-model="formData.username" 
            placeholder="请输入用户名"
            required
          >
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码:</label>
          <input 
            id="password"
            type="password" 
            v-model="formData.password" 
            placeholder="请输入密码"
            required
          >
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录按钮 -->
        <div class="form-actions">
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>

      <!-- 提示信息 -->
      <div class="login-tips">
        <p>测试账号:</p>
        <p>admin / 123456</p>
        <p>user / 123456</p>
        <p>codelearn / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Store
const authStore = useAuthStore()

// 响应式数据
const formData = reactive({
  username: '',
  password: ''
})

const errorMessage = ref('')
const isLoading = ref(false)

// 方法
const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const result = authStore.login(formData.username, formData.password)
    
    if (result.success) {
      // 登录成功，清空表单
      resetForm()
      authStore.closeLoginModal()
    } else {
      // 登录失败，显示错误信息
      errorMessage.value = result.message || '登录失败，请检查用户名和密码'
    }
  } catch (error) {
    console.error('登录异常:', error)
    errorMessage.value = '网络异常，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const handleOverlayClick = () => {
  // 点击遮罩层关闭弹窗
  authStore.closeLoginModal()
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  errorMessage.value = ''
}

const handleKeyEscape = (event) => {
  if (event.key === 'Escape') {
    authStore.closeLoginModal()
  }
}

// 防止背景滚动
const preventBodyScroll = () => {
  if (authStore.showLoginModal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 监听ESC键和防止背景滚动
// eslint-disable-next-line no-unused-vars
const setupEventListeners = () => {
  document.addEventListener('keydown', handleKeyEscape)
  preventBodyScroll()
}

// eslint-disable-next-line no-unused-vars
const cleanupEventListeners = () => {
  document.removeEventListener('keydown', handleKeyEscape)
  document.body.style.overflow = ''
}
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.login-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 420px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.login-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-btn span {
  font-size: 18px;
  line-height: 1;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-actions {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-tips {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 0 0 16px 16px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.login-tips p {
  margin: 5px 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.login-tips p:first-child {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-modal {
    width: 95%;
    margin: 20px;
  }
  
  .login-header {
    padding: 20px 25px 15px;
  }
  
  .login-header h3 {
    font-size: 1.2rem;
  }
  
  .login-form {
    padding: 25px;
  }
  
  .login-tips {
    padding: 15px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-modal {
    background: #2c3e50;
    color: #ecf0f1;
  }
  
  .login-header {
    border-bottom-color: #34495e;
  }
  
  .form-group label {
    color: #ecf0f1;
  }
  
  .form-group input {
    background: #34495e;
    border-color: #34495e;
    color: #ecf0f1;
  }
  
  .form-group input:focus {
    background: #34495e;
    border-color: #667eea;
  }
  
  .login-tips {
    background: #34495e;
    border-top-color: #34495e;
  }
  
  .login-tips p {
    color: #95a5a6;
  }
  
  .login-tips p:first-child {
    color: #ecf0f1;
  }
}
</style> 