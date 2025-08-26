import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/languages',
    name: 'languages',
    component: () => import('../views/LanguagesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/language/:id',
    name: 'languageDetail',
    component: () => import('../views/LanguageDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stacks',
    name: 'stacks',
    component: () => import('../views/StacksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stack/:id',
    name: 'stackDetail',
    component: () => import('../views/StackDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('../views/ResourcesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/code-editor',
    name: 'codeEditor',
    component: () => import('../views/CodeEditorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/counter',
    name: 'counter',
    component: () => import('../views/CounterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pinia-counter',
    name: 'piniaCounter',
    component: () => import('../views/PiniaCounterView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/html-demo',
    name: 'htmlDemo',
    component: () => import('../components/HtmlDemo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rtc',
    name: 'rtc',
    component: () => import('../views/RTCView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/websocket-chat',
    name: 'websocketChat',
    component: () => import('../views/WebSocketChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my_Springboot',
    name: 'mySpringboot',
    component: () => import('../views/MySpringbootView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my_redis',
    name: 'myRedis',
    component: () => import('../views/MyRedisView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要认证的路由
    const authStore = useAuthStore()
    
    if (!authStore.isLoggedIn) {
      // 未登录，显示登录弹窗并停留在当前页面
      authStore.openLoginModal()
      next(false) // 阻止导航
      return
    }
  }
  
  // 允许导航
  next()
})

export default router 