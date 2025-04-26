/**
 * 路由配置文件
 * 定义应用中的所有路由及其对应的组件
 */

// 导入Vue Router的创建函数
import { createRouter, createWebHistory } from 'vue-router'
// 导入首页视图组件 - 直接导入（预加载）
import HomeView from '../views/HomeView.vue'

// 定义路由配置数组
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // 首页组件直接导入
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue') // 关于页使用懒加载方式导入
  },
  {
    path: '/languages',
    name: 'languages',
    component: () => import('../views/LanguagesView.vue') // 编程语言列表页面
  },
  {
    path: '/language/:id',
    name: 'languageDetail',
    component: () => import('../views/LanguageDetailView.vue') // 编程语言详情页，使用动态路由参数id
  },
  {
    path: '/stacks',
    name: 'stacks',
    component: () => import('../views/StacksView.vue') // 技术栈列表页面
  },
  {
    path: '/stack/:id',
    name: 'stackDetail',
    component: () => import('../views/StackDetailView.vue') // 技术栈详情页，使用动态路由参数id
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('../views/ResourcesView.vue') // 学习资源页面
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue') // AI对话页面
  },
  {
    path: '/code-editor',
    name: 'codeEditor',
    component: () => import('../views/CodeEditorView.vue') // 代码编辑器页面
  }
]

// 创建路由实例
const router = createRouter({
  // 使用HTML5 History模式，可以使用干净的URL（没有#号）【Hash模式（有#号）和Memory模式】
  history: createWebHistory(process.env.BASE_URL),
  routes // 应用路由配置
})

// 导出路由实例供main.js使用
export default router 