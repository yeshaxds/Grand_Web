import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import store from './store'
import './assets/styles/index.css'
import './assets/styles/mouse-effects.css'
import './assets/styles/chat.css'
import createClickEffect from './assets/js/mouseClickEffect'

// 初始化鼠标点击特效
createClickEffect()

// 创建应用实例
const app = createApp(App)

// 创建并使用Pinia
const pinia = createPinia()
app.use(pinia)

// 使用其他插件
app.use(store)
app.use(router)

// 挂载应用
app.mount('#app') 