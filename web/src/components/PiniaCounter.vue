<template>
  <div class="pinia-counter">
    <h2 class="title">Pinia 计数器示例</h2>
    
    <!-- 计数显示部分 -->
    <div class="counter-display">
      <div class="count-box">
        <p class="label">当前计数:</p>
        <p class="value">{{ store.count }}</p>
      </div>
      
      <div class="count-box">
        <p class="label">双倍计数:</p>
        <p class="value">{{ store.doubleCount }}</p>
      </div>
      
      <div class="count-box">
        <p class="label">三倍计数:</p>
        <p class="value">{{ store.tripleCount }}</p>
      </div>
      
      <div class="count-box">
        <p class="label">五倍计数:</p>
        <p class="value">{{ store.timesCount(5) }}</p>
      </div>
    </div>
    
    <!-- 按钮操作区 -->
    <div class="counter-actions">
      <button 
        class="action-btn increment" 
        @click="increment"
      >
        增加
      </button>
      
      <button 
        class="action-btn decrement" 
        @click="decrement"
      >
        减少
      </button>
      
      <button 
        class="action-btn async"
        :disabled="store.loading"
        @click="incrementAsync"
      >
        {{ store.loading ? '处理中...' : '异步增加' }}
      </button>
      
      <button 
        class="action-btn reset" 
        @click="reset"
      >
        重置
      </button>
      
      <button 
        class="action-btn batch" 
        @click="updateBatch"
      >
        批量更新
      </button>
    </div>
    
    <!-- 用户信息区 -->
    <div class="user-section">
      <p class="welcome">{{ store.welcomeMessage }}</p>
      
      <div class="login-form" v-if="!store.username">
        <input 
          type="text" 
          v-model="inputUsername" 
          placeholder="请输入用户名"
        />
        <button @click="login" :disabled="!inputUsername.trim()">登录</button>
      </div>
    </div>
    
    <!-- 历史记录区 -->
    <div class="history-section" v-if="store.history.length > 0">
      <h3>操作历史</h3>
      <ul class="history-list">
        <li v-for="(item, index) in store.history" :key="index">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCounterStore } from '@/store/counter'

// 直接使用Composition API的方式创建store
const store = useCounterStore()

// 本地状态
const inputUsername = ref('')

// 方法
function login() {
  if(inputUsername.value.trim()) {
    store.setUsername(inputUsername.value)
    inputUsername.value = ''
    console.log('登录后用户名:', store.username)
  }
}

function increment() {
  store.increment()
  console.log('增加后计数:', store.count)
}

function decrement() {
  store.decrement()
  console.log('减少后计数:', store.count)
}

function incrementAsync() {
  store.incrementAsync()
  console.log('异步增加调用')
}

function reset() {
  store.reset()
  console.log('重置后计数:', store.count)
}

function updateBatch() {
  const randomCount = Math.floor(Math.random() * 100)
  store.batchUpdate(randomCount, store.username)
  console.log('批量更新后计数:', store.count)
}
</script>

<style scoped>
.pinia-counter {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  color: #42b983;
  text-align: center;
  font-weight: 600;
  margin-bottom: 30px;
}

.counter-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.count-box {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.value {
  font-size: 2rem;
  font-weight: bold;
  color: #42b983;
  margin: 0;
}

.counter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.increment {
  background-color: #42b983;
  color: white;
}

.decrement {
  background-color: #ff7875;
  color: white;
}

.async {
  background-color: #1890ff;
  color: white;
}

.reset {
  background-color: #ffc53d;
  color: #333;
}

.batch {
  background-color: #722ed1;
  color: white;
}

.user-section {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.welcome {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 15px;
}

.login-form {
  display: flex;
  gap: 10px;
}

.login-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-form button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.history-section {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.history-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 1.1rem;
}

.history-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.history-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.history-list li:last-child {
  border-bottom: none;
}

@media (max-width: 600px) {
  .counter-display {
    grid-template-columns: 1fr;
  }
  
  .counter-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style> 