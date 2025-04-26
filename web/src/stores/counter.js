import { defineStore } from 'pinia'

// 定义计数器store
export const useCounterStore = defineStore('counter', {
  // 状态 - 存储数据
  state: () => ({
    count: 0,
    username: '',
    loading: false,
    history: []
  }),

  // getters - 类似计算属性，用于从state派生状态
  getters: {
    doubleCount: (state) => state.count * 2,
    tripleCount: (state) => state.count * 3,
    welcomeMessage: (state) => state.username ? `你好，${state.username}！` : '请登录',
    // 带参数的getter
    timesCount: (state) => (multiplier) => state.count * multiplier
  },

  // actions - 修改状态的方法，支持异步操作
  actions: {
    // 同步方法 - 增加计数
    increment() {
      this.count++
      // 记录操作历史
      this.addToHistory('增加')
    },
    
    // 同步方法 - 减少计数
    decrement() {
      this.count--
      this.addToHistory('减少')
    },
    
    // 异步方法 - 延迟增加计数
    async incrementAsync() {
      // 设置加载状态
      this.loading = true
      
      try {
        // 使用Promise模拟异步操作
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.count++
        this.addToHistory('异步增加')
      } finally {
        this.loading = false
      }
    },
    
    // 设置用户名
    setUsername(name) {
      this.username = name
    },
    
    // 重置所有状态
    reset() {
      // 使用$reset()方法重置state到初始状态
      this.$reset()
    },
    
    // 批量更新状态 - 使用$patch方法
    batchUpdate(newCount, newUsername) {
      this.$patch({
        count: newCount,
        username: newUsername
      })
    },
    
    // 记录历史操作
    addToHistory(action) {
      const now = new Date()
      const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      this.history.push(`${time} - ${action}：${this.count}`)
      
      // 只保留最近5条记录
      if (this.history.length > 5) {
        this.history.shift()
      }
    }
  }
}) 