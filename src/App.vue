<template>
  <nav>
    <div class="logo">CodeLearn</div>
    <div class="nav-links">
      <router-link to="/">首页</router-link>
      <router-link to="/languages">编程语言</router-link>
      <router-link to="/stacks">技术栈</router-link>
      <router-link to="/resources">学习资源</router-link>
      <router-link to="/about">关于我们</router-link>
    </div>
  </nav>
  <router-view/>
</template> 