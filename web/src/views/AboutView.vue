<template>
  <div class="about">
    <h1>关于 CodeLearn</h1>
    
    <div class="about-section">
      <h2>我们的使命</h2>
      <p>CodeLearn 致力于帮助编程学习者探索不同的编程语言和技术栈，提供系统化的学习路径和优质的学习资源，使编程学习变得更加简单和有效。</p>
    </div>
    
    <div class="about-section">
      <h2>我们提供什么</h2>
      <ul class="features-list">
        <li>
          <div class="feature-icon">📚</div>
          <div class="feature-text">
            <h3>全面的编程语言指南</h3>
            <p>涵盖主流编程语言的详细学习路径、语法特性和实践案例。</p>
          </div>
        </li>
        <li>
          <div class="feature-icon">🔧</div>
          <div class="feature-text">
            <h3>技术栈解析</h3>
            <p>深入解析各种流行技术栈的组成、优缺点和适用场景。</p>
          </div>
        </li>
        <li>
          <div class="feature-icon">🗺️</div>
          <div class="feature-text">
            <h3>个性化学习路径</h3>
            <p>根据学习目标和基础提供定制化的学习计划和进度跟踪。</p>
          </div>
        </li>
        <li>
          <div class="feature-icon">👥</div>
          <div class="feature-text">
            <h3>学习社区</h3>
            <p>与其他学习者交流经验，解决问题，共同进步。</p>
          </div>
        </li>
      </ul>
    </div>
    
    <div class="about-section">
      <h2>联系我们</h2>
      <p>如果您有任何问题、建议或合作意向，欢迎通过以下方式联系我们：</p>
      <div class="contact-info">
        <p><strong>邮箱：</strong> contact@codelearn.example.com</p>
        <p><strong>GitHub：</strong> <a href="https://github.com/codelearn" target="_blank">github.com/codelearn</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
// AboutView 是纯展示组件，不需要响应式数据或方法
// 使用 script setup 让代码更简洁
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.about-section {
  margin-bottom: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 2rem;
  margin-right: 15px;
  flex-shrink: 0;
}

.feature-text h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.feature-text p {
  margin: 0;
  color: #666;
}

.contact-info {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.contact-info p {
  margin: 10px 0;
}

.contact-info a {
  color: #3498db;
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about {
    padding: 10px;
  }
  
  .about-section {
    padding: 15px;
  }
  
  .features-list li {
    flex-direction: column;
    text-align: center;
  }
  
  .feature-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style> 