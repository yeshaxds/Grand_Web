import { defineStore } from 'pinia'
import { validateUser, getUserById } from '@/data/users.js'

export const useAuthStore = defineStore('auth', {
  // 状态
  state: () => ({
    // 用户信息
    user: null,
    // 是否已登录
    isLoggedIn: false,
    // 登录弹窗显示状态
    showLoginModal: false
  }),

  // 计算属性
  getters: {
    // 获取用户头像
    userAvatar: (state) => {
      return state.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    },
    // 获取用户昵称
    userNickname: (state) => {
      return state.user?.nickname || '未登录'
    },
    // 获取用户名
    username: (state) => {
      return state.user?.username || ''
    }
  },

  // 方法
  actions: {
    // 登录
    login(username, password) {
      const user = validateUser(username, password)
      if (user) {
        this.user = user
        this.isLoggedIn = true
        this.showLoginModal = false
        
        // 将登录状态保存到localStorage
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('isLoggedIn', 'true')
        
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: '用户名或密码错误' }
      }
    },

    // 登出
    logout() {
      this.user = null
      this.isLoggedIn = false
      this.showLoginModal = false
      
      // 清除localStorage中的登录状态
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
    },

    // 显示登录弹窗
    openLoginModal() {
      this.showLoginModal = true
    },

    // 关闭登录弹窗
    closeLoginModal() {
      this.showLoginModal = false
    },

    // 检查登录状态（从localStorage恢复）
    checkAuthState() {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const userStr = localStorage.getItem('user')
      
      if (isLoggedIn === 'true' && userStr) {
        try {
          const user = JSON.parse(userStr)
          // 验证用户数据完整性
          const validUser = getUserById(user.id)
          if (validUser) {
            this.user = validUser
            this.isLoggedIn = true
          } else {
            // 用户数据无效，清除状态
            this.logout()
          }
        } catch (error) {
          console.error('解析用户数据失败:', error)
          this.logout()
        }
      }
    },

    // 初始化认证状态
    initAuth() {
      this.checkAuthState()
    }
  }
}) 