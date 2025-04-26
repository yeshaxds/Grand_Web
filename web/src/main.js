/**
 * 应用程序入口文件
 * 负责初始化Vue应用程序实例，并挂载到DOM
 */

// 导入Vue 3的createApp函数，用于创建Vue应用实例
import { createApp } from 'vue'
// 导入根组件App
import App from './App.vue'
// 导入路由配置
import router from './router'
// 导入Vuex状态管理
import store from './store'
// 导入全局样式文件
import './assets/styles/index.css'
// 导入鼠标特效样式
import './assets/styles/mouse-effects.css'
// 导入聊天界面样式
import './assets/styles/chat.css'
// 导入鼠标点击特效功能
import createClickEffect from './assets/js/mouseClickEffect'

// 初始化鼠标点击特效 //要重新启动才会生效
createClickEffect()

// 创建Vue应用实例
// 使用store进行状态管理
// 使用router进行路由管理
// 将应用挂载到id为'app'的DOM元素上
createApp(App).use(store).use(router).mount('#app') 