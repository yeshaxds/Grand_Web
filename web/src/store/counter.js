import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 使用组合式API风格创建store
export const useCounterStore = defineStore('counter', () => {
  // 状态 - ref
  const count = ref(0)
  const username = ref('')
  const loading = ref(false)
  const history = ref([])

  // getters - computed
  const doubleCount = computed(() => count.value * 2)
  const tripleCount = computed(() => count.value * 3)
  const welcomeMessage = computed(() => username.value ? `你好，${username.value}！` : '请登录')
  
  // 带参数的getter - 函数
  function timesCount(multiplier) {
    return count.value * multiplier
  }

  // actions - 方法
  function increment() {
    count.value++
    console.log('store中increment:', count.value)
    addToHistory('增加')
  }
  
  function decrement() {
    count.value--
    console.log('store中decrement:', count.value)
    addToHistory('减少')
  }
  
  async function incrementAsync() {
    loading.value = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      count.value++
      console.log('store中incrementAsync:', count.value)
      addToHistory('异步增加')
    } finally {
      loading.value = false
    }
  }
  
  function setUsername(name) {
    username.value = name
    console.log('store中setUsername:', name)
  }
  
  function reset() {
    count.value = 0
    username.value = ''
    history.value = []
    console.log('store中reset')
  }
  
  function batchUpdate(newCount, newUsername) {
    count.value = newCount
    if (newUsername) {
      username.value = newUsername
    }
    console.log('store中batchUpdate:', newCount)
  }
  
  function addToHistory(action) {
    const now = new Date()
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    history.value.push(`${time} - ${action}：${count.value}`)
    
    if (history.value.length > 5) {
      history.value.shift()
    }
  }

  // 暴露状态和方法
  return {
    // 状态
    count,
    username,
    loading,
    history,
    // getters
    doubleCount,
    tripleCount,
    welcomeMessage,
    timesCount,
    // actions
    increment,
    decrement,
    incrementAsync,
    setUsername,
    reset,
    batchUpdate
  }
}) 