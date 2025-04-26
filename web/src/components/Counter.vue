<template>
  <div class="counter-container">
    <h2>Vuex示例</h2>
    
    <div class="counter-section">
      <h3>计数器</h3>
      <p>当前计数: {{ count }}</p>
      <p>双倍计数: {{ doubleCount }}</p>
      <div class="button-group">
        <button @click="increment">+1</button>
        <button @click="decrement">-1</button>
        <button @click="incrementAsync">延迟+1</button>
      </div>
    </div>
    
    <div class="login-section">
      <h3>{{ welcomeMessage }}</h3>
      <div v-if="!username" class="login-form">
        <input v-model="inputUsername" placeholder="请输入用户名" />
        <button @click="login">登录</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'CounterComponent',
  data() {
    return {
      inputUsername: ''
    }
  },
  computed: {
    ...mapState(['count', 'username']),
    ...mapGetters(['doubleCount', 'welcomeMessage'])
  },
  methods: {
    ...mapMutations(['increment', 'decrement']),
    ...mapActions(['incrementAsync']),
    login() {
      if (this.inputUsername.trim()) {
        this.$store.dispatch('login', this.inputUsername)
          .then(() => {
            this.inputUsername = ''
          })
      }
    }
  }
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