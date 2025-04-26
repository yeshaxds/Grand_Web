<template>
  <div class="html-demo">
    <h2>v-html 指令示例</h2>
    
    <div class="explanation">
      <p>v-html 指令用于将变量中的 HTML 字符串渲染为真实的 HTML 元素</p>
    </div>
    
    <div class="demo-section">
      <h3>使用 v-text 或 插值语法 (默认行为)</h3>
      <div class="output output-text">
        <p>原始输出 (使用插值语法): {{ htmlContent }}</p>
      </div>
      
      <h3>使用 v-html (渲染为真实 HTML)</h3>
      <div class="output output-html">
        <p>HTML 渲染 (使用 v-html): <span v-html="htmlContent"></span></p>
      </div>
    </div>
    
    <div class="controls">
      <h3>试试修改 HTML 内容:</h3>
      <textarea v-model="htmlContent" rows="5" cols="50"></textarea>
    </div>
    
    <div class="warning">
      <h3>安全警告:</h3>
      <p>
        <strong>注意:</strong> 使用 v-html 渲染不受信任的内容会导致 XSS (跨站脚本攻击) 风险。
        只对可信内容使用 v-html，绝不要将用户提供的内容作为 HTML 渲染。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 包含HTML标签的字符串
const htmlContent = ref('<strong>这是加粗文字</strong> 和 <span style="color: red;">红色文字</span>, 还有一个 <a href="https://vuejs.org" target="_blank">链接</a>')
</script>

<style scoped>
.html-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  color: #42b983;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

h3 {
  color: #2c3e50;
  margin-top: 20px;
}

.explanation {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.output {
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.output-text {
  background-color: #f5f5f5;
}

.output-html {
  background-color: #e6f7ff;
}

.controls {
  margin-bottom: 30px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: monospace;
}

.warning {
  background-color: #fff1f0;
  border-left: 5px solid #ff4d4f;
  padding: 15px;
  border-radius: 0 5px 5px 0;
}
</style> 