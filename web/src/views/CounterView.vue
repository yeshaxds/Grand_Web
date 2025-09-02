<template>
  <div class="counter-view">
    <h1>Pinia 状态管理示例</h1>
    <div class="description">
      <p>这是一个现代化的Pinia状态管理示例，展示了如何在Vue 3应用中使用Pinia管理状态。</p>
      <p>Pinia是Vue的现代状态管理库，相比Vuex有以下优势：</p>
      <ul>
        <li><strong>TypeScript支持</strong>: 原生TypeScript支持，更好的类型推导</li>
        <li><strong>更简单的API</strong>: 不需要mutations，直接修改state</li>
        <li><strong>更好的开发体验</strong>: 支持热更新和时间旅行调试</li>
        <li><strong>模块化</strong>: 每个store都是独立的，更容易组织代码</li>
        <li><strong>Vue 3优化</strong>: 为Vue 3的Composition API而设计</li>
      </ul>
    </div>
    
    <CounterComponent />
    
    <div class="code-preview">
      <h3>Pinia Store代码实现：</h3>
      <pre>
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    username: '',
    loading: false,
    history: []
  }),

  // getters - 类似计算属性
  getters: {
    doubleCount: (state) => state.count * 2,
    welcomeMessage: (state) => state.username ? `你好，${state.username}！` : '请登录'
  },

  // actions - 处理业务逻辑（支持同步和异步）
  actions: {
    increment() {
      this.count++
      this.addToHistory('增加')
    },
    
    decrement() {
      this.count--
      this.addToHistory('减少')
    },
    
    async incrementAsync() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.count++
      this.addToHistory('异步增加')
      this.loading = false
    },
    
    setUsername(name) {
      this.username = name
    }
  }
})
      </pre>
    </div>

    <div class="composition-api-example">
      <h3>在组件中使用（Composition API）：</h3>
      <pre>
&lt;script setup&gt;
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

// 使用store
const counterStore = useCounterStore()

// 解构响应式状态（保持响应性）
const { count, username, loading } = storeToRefs(counterStore)

// 解构actions
const { increment, decrement, incrementAsync } = counterStore
&lt;/script&gt;
      </pre>
    </div>
  </div>
</template>

<script setup>
import CounterComponent from '@/components/Counter.vue'
</script>

<style scoped>
.counter-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #42b983;
  text-align: center;
  margin-bottom: 30px;
}

.description {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

ul {
  margin-top: 10px;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

.code-preview {
  margin-top: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

pre {
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.composition-api-example {
  margin-top: 30px;
  background-color: #e8f5e8;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #42b983;
}
</style> 