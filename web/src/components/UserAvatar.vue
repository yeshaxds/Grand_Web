<template>
  <div class="user-avatar-container">
    <!-- 用户头像和状态 -->
    <div class="user-avatar" @click="handleAvatarClick">
      <img :src="authStore.userAvatar" :alt="authStore.userNickname" />
      <div class="user-status" :class="{ 'logged-in': authStore.isLoggedIn }"></div>
    </div>

    <!-- 用户下拉菜单 -->
    <div class="user-menu" v-show="showMenu" @click.stop>
      <div v-if="authStore.isLoggedIn" class="user-info">
        <div class="user-details">
          <img :src="authStore.userAvatar" :alt="authStore.userNickname" />
          <div class="user-text">
            <div class="user-nickname">{{ authStore.userNickname }}</div>
            <div class="user-username">@{{ authStore.username }}</div>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <span>退出登录</span>
        </button>
      </div>
      
      <div v-else class="not-logged-in">
        <div class="welcome-text">
          <p>欢迎访问 CodeLearn</p>
          <p>请登录以访问更多功能</p>
        </div>
        <button @click="handleLogin" class="login-trigger-btn">
          <span>立即登录</span>
        </button>
      </div>
    </div>

    <!-- 点击外部关闭菜单的遮罩 -->
    <div v-show="showMenu" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// 使用路由和store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const showMenu = ref(false)

// 方法
const handleAvatarClick = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleLogin = () => {
  authStore.openLoginModal()
  showMenu.value = false
}

const handleLogout = () => {
  authStore.logout()
  showMenu.value = false
  // 跳转到首页
  if (route.path !== '/') {
    router.push('/')
  }
}

// 点击外部关闭菜单的处理函数
let menuCloseHandler

onMounted(() => {
  // 点击文档其他地方关闭菜单
  menuCloseHandler = (e) => {
    // 这里需要检查点击的元素是否在组件内
    const container = document.querySelector('.user-avatar-container')
    if (container && !container.contains(e.target)) {
      showMenu.value = false
    }
  }
  document.addEventListener('click', menuCloseHandler)
})

onUnmounted(() => {
  // 清理事件监听器
  if (menuCloseHandler) {
    document.removeEventListener('click', menuCloseHandler)
  }
})
</script>

<style scoped>
/* 用户头像容器 */
.user-avatar-container {
  position: relative;
  z-index: 1000;
}

/* 用户头像 */
.user-avatar {
  position: relative;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 3px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  background: #f0f2f5;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 用户状态指示器 */
.user-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e74c3c;
  border: 2px solid white;
  transition: background-color 0.3s;
}

.user-status.logged-in {
  background-color: #27ae60;
}

/* 用户菜单 */
.user-menu {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 260px;
  overflow: hidden;
  animation: menuSlideDown 0.2s ease-out;
  border: 1px solid #e1e5e9;
}

@keyframes menuSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 菜单遮罩 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

/* 已登录用户信息 */
.user-info {
  padding: 20px;
}

.user-details {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.user-details img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid #e1e5e9;
}

.user-text {
  flex: 1;
}

.user-nickname {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-username {
  font-size: 13px;
  color: #666;
}

.logout-btn {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* 未登录状态 */
.not-logged-in {
  padding: 20px;
  text-align: center;
}

.welcome-text {
  margin-bottom: 16px;
}

.welcome-text p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.welcome-text p:first-child {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.login-trigger-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-trigger-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-menu {
    right: -10px;
    min-width: 240px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .user-status {
    width: 10px;
    height: 10px;
  }
}</style> 