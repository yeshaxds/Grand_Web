import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/styles/index.css'
import './assets/styles/mouse-effects.css'
import './assets/styles/chat.css'
import createClickEffect from './assets/js/mouseClickEffect'

// 初始化鼠标点击特效
createClickEffect()

// 创建应用实例
const app = createApp(App)

// 创建并使用Pinia（Vue 3推荐的状态管理）
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app') 