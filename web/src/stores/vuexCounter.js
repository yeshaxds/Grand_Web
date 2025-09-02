import { defineStore } from 'pinia'

// 创建Vuex功能的Pinia版本，用于迁移演示
export const useVuexCounterStore = defineStore('vuexCounter', {
  // 状态
  state: () => ({
    count: 0,
    username: ''
  }),

  // getters - 类似计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    welcomeMessage: (state) => state.username ? `你好，${state.username}！` : '请登录'
  },

  // actions - 处理业务逻辑
  actions: {
    // 同步操作
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    // 异步操作
    async incrementAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.count++
          resolve()
        }, 1000)
      })
    },
    
    // 登录操作
    async login(username) {
      // 模拟API请求
      return new Promise((resolve) => {
        setTimeout(() => {
          this.username = username
          resolve()
        }, 500)
      })
    },
    
    // 退出登录
    logout() {
      this.username = ''
    },
    
    // 重置状态
    reset() {
      this.$reset()
    }
  }
}) 