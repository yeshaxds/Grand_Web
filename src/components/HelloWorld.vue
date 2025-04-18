<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      欢迎使用这个Vue 3项目模板
    </p>
    <h3>安装的插件</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
    </ul>
    <h3>必备文档</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Vue.js官方文档</a></li>
      <li><a href="https://cli.vuejs.org" target="_blank" rel="noopener">Vue CLI配置参考</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script> 