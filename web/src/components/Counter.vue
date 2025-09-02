<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="counter-container">
    <h2>Pinia示例（已升级）</h2>
    
    <div class="counter-section">
      <h3>计数器</h3>
      <p>当前计数: {{ count }}</p>
      <p>双倍计数: {{ doubleCount }}</p>
      <p v-if="loading" class="loading">操作中...</p>
      <div class="button-group">
        <button @click="increment" :disabled="loading">+1</button>
        <button @click="decrement" :disabled="loading">-1</button>
        <button @click="incrementAsync" :disabled="loading">延迟+1</button>
        <button @click="reset">重置</button>
      </div>
    </div>
    
    <div class="login-section">
      <h3>{{ welcomeMessage }}</h3>
      <div v-if="!username" class="login-form">
        <input v-model="inputUsername" placeholder="请输入用户名" @keyup.enter="login" />
        <button @click="login" :disabled="!inputUsername.trim()">登录</button>
      </div>
      <div v-else class="logout-section">
        <p>欢迎，{{ username }}！</p>
        <button @click="logout">退出登录</button>
      </div>
    </div>

    <!-- 操作历史 -->
    <div v-if="history.length > 0" class="history-section">
      <h3>操作历史</h3>
      <ul>
        <li v-for="(record, index) in history" :key="index">{{ record }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

// 使用Pinia store
const counterStore = useCounterStore()

// 解构响应式状态（使用storeToRefs保持响应性）
const { count, username, loading, history, doubleCount, welcomeMessage } = storeToRefs(counterStore)

// 解构actions（actions不需要storeToRefs）
const { increment, decrement, incrementAsync, setUsername, reset } = counterStore

// 本地响应式数据
const inputUsername = ref('')

// 登录方法
const login = () => {
  if (inputUsername.value.trim()) {
    setUsername(inputUsername.value.trim())
    inputUsername.value = ''
  }
}

// 退出登录方法
const logout = () => {
  setUsername('')
}
</script>

<style scoped>
.counter-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.counter-section, .login-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.login-form {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
}
</style> 