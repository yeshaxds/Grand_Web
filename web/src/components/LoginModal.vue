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

<script>
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'LoginModal',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      // 表单数据
      formData: {
        username: '',
        password: ''
      },
      // 错误信息
      errorMessage: '',
      // 加载状态
      isLoading: false
    }
  },
  methods: {
    // 处理登录
    async handleLogin() {
      this.errorMessage = ''
      this.isLoading = true

      try {
        const result = this.authStore.login(this.formData.username, this.formData.password)
        
        if (result.success) {
          // 登录成功，清空表单
          this.formData.username = ''
          this.formData.password = ''
          this.$emit('login-success')
        } else {
          // 登录失败，显示错误信息
          this.errorMessage = result.message
        }
      } catch (error) {
        this.errorMessage = '登录过程中发生错误，请稍后重试'
        console.error('登录错误:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 处理遮罩点击
    handleOverlayClick() {
      this.authStore.closeLoginModal()
    }
  },
  watch: {
    // 监听弹窗显示状态，重置表单
    'authStore.showLoginModal'(newVal) {
      if (newVal) {
        this.errorMessage = ''
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* 弹窗遮罩 */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

/* 登录弹窗 */
.login-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

/* 弹窗动画 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 弹窗头部 */
.login-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.login-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 登录表单 */
.login-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 错误信息 */
.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  border: 1px solid #fed7d7;
}

/* 表单操作区 */
.form-actions {
  margin-top: 24px;
}

.login-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 提示信息 */
.login-tips {
  background-color: #f8f9fa;
  padding: 16px 24px;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #eee;
}

.login-tips p {
  margin: 2px 0;
  font-size: 13px;
  color: #666;
}

.login-tips p:first-child {
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}
</style> 