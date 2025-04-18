<template>
  <!-- 全局背景图层 -->
  <div class="global-background-layer"></div>
  
  <nav>
    <div class="logo">
      <img src="@/assets/logo.webp" alt="网站Logo">     
      <span>CodeLearn</span>
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
  <router-view/>
</template>
