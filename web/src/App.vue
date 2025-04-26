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
      <router-link to="/about">关于我们</router-link>
    </div>
  </nav>

  <!-- 路由视图 - 根据当前路由显示对应的组件 -->
  <router-view />
</template>

<script>
// 导入获取随机励志语句的函数
import { getRandomQuote } from '@/data/motivationalQuotes.js'

export default {
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
</style>
