<template>
  <!-- 全局背景图层 - 为整个应用提供背景效果 -->
  <div class="global-background-layer"></div>

  <!-- 顶部导航栏{html5 新增的语义化标签} -->
  <nav>
    <!-- 网站Logo和标题 -->
    <div class="logo">
      <img src="@/assets/logo.webp" alt="网站Logo">
      <span>CodeLearn</span>
    </div>

    <!-- 励志语句显示区域 - 位于导航栏中间 -->
    <div class="nav-quote-h">
      <div class="quote-h-content">
        <span class="quote-h-text">"{{ randomQuote.text }}"</span>
        <span class="quote-h-author">— {{ randomQuote.author }}</span>
      </div>
      <!-- 更换励志语句的按钮 -->
      <button class="refresh-quote-h" @click="refreshQuote" title="换一条">
        <span>↻</span>
      </button>
    </div>

    <!-- 导航链接列表 -->
    <div class="nav-links">
      <router-link to="/">首页</router-link>
      <router-link to="/languages">编程语言</router-link>
      <router-link to="/stacks">技术栈</router-link>
      <router-link to="/resources">学习资源</router-link>
      <router-link to="/code-editor">代码编辑器</router-link>
      <router-link to="/chat">AI对话</router-link>
      <div class="data_base">
        <span>数据库</span>
        <div class="data_base_content">
          <p><router-link to="/my_Springboot">my_Springboot</router-link></p>
          <p><router-link to="/my_redis">my_redis</router-link></p>
        </div>
      </div>
      <div class="nav-links-exm">
        <span>示例</span>
        <div class="nav-links-exm-content">
          <p><router-link to="/rtc">WebRTC</router-link></p>
          <p><router-link to="/counter">Vuex示例</router-link></p>
          <p><router-link to="/pinia-counter">Pinia示例</router-link></p>
          <p><router-link to="/websocket-chat">WebSocket聊天</router-link></p>
          <p><router-link to="/html-demo">v-html示例</router-link></p>
        </div>
      </div>

      <router-link to="/about">关于我们</router-link>
    </div>

    <!-- 用户头像组件 -->
    <div class="user-section">
      <UserAvatar />
    </div>
  </nav>

  <!-- 路由视图 - 根据当前路由显示对应的组件 -->
  <router-view />
  
  <!-- 登录弹窗组件 -->
  <LoginModal />
</template>

<script>
// 导入获取随机励志语句的函数
import { getRandomQuote } from '@/data/motivationalQuotes.js'
// 导入认证store
import { useAuthStore } from '@/stores/authStore'
// 导入组件
import UserAvatar from '@/components/UserAvatar.vue'
import LoginModal from '@/components/LoginModal.vue'

export default {
  // 组件
  components: {
    UserAvatar,
    LoginModal
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  // 组件数据
  data() {
    return {
      // 随机励志语句对象，包含文本和作者
      randomQuote: { text: '', author: '' }
    }
  },
  // 组件挂载完成后的生命周期钩子
  mounted() {
    // 获取一条随机励志语句显示在导航栏
    this.randomQuote = getRandomQuote();
    
    // 初始化认证状态
    this.authStore.initAuth();
  },
  // 组件方法
  methods: {
    // 刷新励志语句 - 当用户点击刷新按钮时调用
    refreshQuote() {
      this.randomQuote = getRandomQuote();
    }
  }
}
</script>

<style>
@import url('./assets/styles/quote.css');

/* 导航栏整体布局优化 */
nav {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  min-height: 60px;
}

/* Logo区域 - 固定宽度 */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  flex-shrink: 0;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo span {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* 励志语句区域 - 弹性宽度，但限制最大宽度 */
.nav-quote-h {
  flex: 1;
  max-width: 400px;
  min-width: 200px;
  margin: 0 15px;
}

/* 导航链接区域 - 紧凑布局 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-links > a {
  padding: 6px 12px;
  font-size: 14px;
  white-space: nowrap;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-links > a:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

/* 下拉菜单优化 */
.data_base,
.nav-links-exm {
  position: relative;
  font-size: 14px;
}

.data_base > span,
.nav-links-exm > span {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.data_base:hover > span,
.nav-links-exm:hover > span {
  background-color: rgba(52, 152, 219, 0.1);
}

/* 用户区域样式 */
.user-section {
  margin-left: 15px;
  flex-shrink: 0;
}

/* 中等屏幕优化 */
@media (max-width: 1200px) {
  nav {
    padding: 8px 10px;
  }
  
  .nav-links {
    gap: 8px;
  }
  
  .nav-links > a {
    padding: 4px 8px;
    font-size: 13px;
  }
  
  .logo {
    min-width: 120px;
  }
  
  .logo span {
    font-size: 16px;
  }
  
  .nav-quote-h {
    max-width: 300px;
    margin: 0 10px;
  }
}

/* 小屏幕优化 */
@media (max-width: 992px) {
  nav {
    flex-wrap: wrap;
    padding: 5px 10px;
    min-height: auto;
  }
  
  .logo {
    order: 1;
    min-width: 100px;
  }
  
  .user-section {
    order: 2;
    margin-left: auto;
    margin-right: 0;
  }
  
  .nav-quote-h {
    order: 3;
    width: 100%;
    margin: 8px 0 5px 0;
    max-width: none;
  }
  
  .nav-links {
    order: 4;
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 5px;
  }
  
  .nav-links > a {
    font-size: 12px;
    padding: 3px 6px;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .user-section {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1001;
  }
  
  nav {
    padding-right: 60px; /* 为固定定位的用户头像留出空间 */
  }
}
</style>
