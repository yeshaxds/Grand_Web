import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/languages',
    name: 'languages',
    component: () => import('../views/LanguagesView.vue')
  },
  {
    path: '/language/:id',
    name: 'languageDetail',
    component: () => import('../views/LanguageDetailView.vue')
  },
  {
    path: '/stacks',
    name: 'stacks',
    component: () => import('../views/StacksView.vue')
  },
  {
    path: '/stack/:id',
    name: 'stackDetail',
    component: () => import('../views/StackDetailView.vue')
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('../views/ResourcesView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue')
  },
  {
    path: '/code-editor',
    name: 'codeEditor',
    component: () => import('../views/CodeEditorView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 