<template>
  <!-- 全局背景图层 -->
  <div class="global-background-layer"></div>

  <nav>
    <div class="logo">
      <img src="@/assets/logo.webp" alt="网站Logo">
      <span>CodeLearn</span>
    </div>

    <!-- 励志语句显示在导航栏中间 -->
    <div class="nav-quote">
      <div class="quote-content">
        <span class="quote-text">"{{ randomQuote.text }}"</span>
        <span class="quote-author">— {{ randomQuote.author }}</span>
      </div>
      <button class="refresh-quote" @click="refreshQuote" title="换一条">
        <span>↻</span>
      </button>
    </div>

    <div class="nav-links">
      <router-link to="/">首页</router-link>
      <router-link to="/languages">编程语言</router-link>
      <router-link to="/stacks">技术栈</router-link>
      <router-link to="/resources">学习资源</router-link>
      <router-link to="/code-editor">代码编辑器</router-link>
      <router-link to="/chat">AI对话</router-link>
      <router-link to="/about">关于我们</router-link>
    </div>
  </nav>
  <router-view />
</template>

<script>
import { getRandomQuote } from '@/data/motivationalQuotes.js'

export default {
  data() {
    return {
      randomQuote: { text: '', author: '' }
    }
  },
  mounted() {
    // 获取随机励志语句
    this.randomQuote = getRandomQuote();
  },
  methods: {
    refreshQuote() {
      this.randomQuote = getRandomQuote();
    }
  }
}
</script>

<style>
/* 导航栏中的励志语句样式 */
.nav-quote {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 10px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.quote-content {
  display: flex;
  gap: 10px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quote-text {
  font-style: italic;
  color: #2c3e50;
  font-size: 0.9rem;
}

.quote-author {
  opacity: 0.8;
  color: #42b983;
  font-size: 0.85rem;
  font-weight: 500;
}

.refresh-quote {
  background: transparent;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 1.1rem;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.refresh-quote:hover {
  background: rgba(66, 185, 131, 0.1);
  transform: rotate(180deg);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  flex-shrink: 0;
  margin-left: 1rem;
}
@media (max-width: 1200px) {
  .nav-quote {
    display: none;
  }

  nav {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    padding: 1rem;
  }

  .logo {
    margin-bottom: 1rem;
    margin-right: 0;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-left: 0;
  }
}
</style>
