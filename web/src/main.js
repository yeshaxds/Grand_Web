import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/index.css'
import './assets/styles/mouse-effects.css'
import createClickEffect from './assets/js/mouseClickEffect'

// 初始化鼠标点击特效 //要重新启动才会生效
createClickEffect()

createApp(App).use(store).use(router).mount('#app') 