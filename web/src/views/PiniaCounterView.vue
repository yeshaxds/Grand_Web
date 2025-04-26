<template>
  <div class="pinia-counter-view">
    <h1>基于 Pinia 的状态管理示例</h1>
    
    <div class="description">
      <p>这是使用 Pinia 实现的状态管理示例，展示了如何在 Vue 3 应用中使用 Pinia 管理状态。</p>
      <p>Pinia 是 Vue 官方推荐的状态管理方案，为 Vue 3 设计，提供更简洁的 API 和更好的类型推断支持。</p>
      
      <div class="features">
        <h3>Pinia 的核心概念：</h3>
        <ul>
          <li><strong>State</strong>：状态，存储应用的数据</li>
          <li><strong>Getters</strong>：类似于计算属性，可以派生状态</li>
          <li><strong>Actions</strong>：包含业务逻辑的方法，支持同步和异步操作</li>
        </ul>
        
        <h3>Pinia 相比 Vuex 的优势：</h3>
        <ul>
          <li>更简洁的 API（取消了 mutations）</li>
          <li>完整的 TypeScript 支持</li>
          <li>自动代码分割</li>
          <li>更好的开发体验（支持热更新）</li>
          <li>与 Vue 3 Composition API 完美结合</li>
        </ul>
      </div>
    </div>
    
    <PiniaCounter />
    
    <div class="code-preview">
      <h3>Store 代码示例：</h3>
      <pre><code>// store/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态
  state: () => ({
    count: 0,
    username: ''
  }),
  
  // getters
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  // actions
  actions: {
    increment() {
      this.count++
    },
    
    async incrementAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.count++
    }
  }
})</code></pre>
    </div>
    
    <div class="usage-sample">
      <h3>如何在组件中使用：</h3>
      <pre><code>// 在组件中使用
import { useCounterStore } from '@/store/counter'

// 创建store实例
const counter = useCounterStore()

// 使用状态
console.log(counter.count)

// 修改状态
counter.increment()

// 使用getters
console.log(counter.doubleCount)</code></pre>
    </div>
  </div>
</template>

<script setup>
import PiniaCounter from '@/components/PiniaCounter.vue'
</script>

<style scoped>
.pinia-counter-view {
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

.features {
  margin-top: 20px;
}

ul {
  margin-top: 10px;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
}

.code-preview, .usage-sample {
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

code {
  font-family: 'Courier New', monospace;
}
</style> 