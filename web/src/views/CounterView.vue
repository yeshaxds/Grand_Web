<template>
  <div class="counter-view">
    <h1>Vuex 状态管理示例</h1>
    <div class="description">
      <p>这是一个简单的Vuex状态管理示例，展示了如何在Vue应用中使用Vuex管理状态。</p>
      <p>Vuex提供了集中式的状态管理方案，包含以下几个核心概念：</p>
      <ul>
        <li><strong>State</strong>: 应用的状态数据</li>
        <li><strong>Getters</strong>: 从状态派生的计算属性</li>
        <li><strong>Mutations</strong>: 修改状态的同步函数</li>
        <li><strong>Actions</strong>: 可包含异步操作的函数</li>
      </ul>
    </div>
    
    <CounterComponent />
    
    <div class="code-preview">
      <h3>Store代码实现：</h3>
      <pre>
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    username: ''
  },
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
    welcomeMessage(state) {
      return state.username ? `你好，${state.username}！` : '请登录'
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    decrement(state) {
      state.count--
    },
    setUsername(state, username) {
      state.username = username
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
    login({ commit }, username) {
      // 模拟API请求
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('setUsername', username)
          resolve()
        }, 500)
      })
    }
  }
})
      </pre>
    </div>
  </div>
</template>

<script>
import CounterComponent from '@/components/Counter.vue'

export default {
  name: 'CounterView',
  components: {
    CounterComponent
  }
}
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
</style> 