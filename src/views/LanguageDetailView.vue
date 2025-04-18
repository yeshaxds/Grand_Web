<template>
  <div class="language-detail" v-if="language">
    <div class="header">
      <div class="language-icon">{{ language.icon }}</div>
      <div class="header-content">
        <h1>{{ language.name }}</h1>
        <div class="language-categories">
          <span v-for="tag in language.categories" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-content">
        <section class="overview">
          <h2>概述</h2>
          <p>{{ language.description }}</p>
          <p>{{ language.longDescription }}</p>
        </section>

        <section class="features">
          <h2>主要特性</h2>
          <ul>
            <li v-for="(feature, index) in language.features" :key="index">
              <strong>{{ feature.title }}:</strong> {{ feature.description }}
            </li>
          </ul>
        </section>

        <section class="use-cases">
          <h2>适用场景</h2>
          <div class="use-case-cards">
            <div class="use-case-card" v-for="(useCase, index) in language.useCases" :key="index">
              <div class="use-case-icon">{{ useCase.icon }}</div>
              <h3>{{ useCase.title }}</h3>
              <p>{{ useCase.description }}</p>
            </div>
          </div>
        </section>

        <section class="code-example">
          <h2>代码示例</h2>
          <div class="code-block">
            <pre><code>{{ language.codeExample }}</code></pre>
          </div>
        </section>
      </div>

      <div class="sidebar">
        <div class="learning-path-card">
          <h3>学习路径</h3>
          <ol>
            <li v-for="(step, index) in language.learningPath" :key="index">
              {{ step }}
            </li>
          </ol>
          <button class="start-learning">开始学习</button>
        </div>

        <div class="resources-card">
          <h3>相关资源</h3>
          <ul>
            <li v-for="(resource, index) in language.resources" :key="index">
              <a :href="resource.url" target="_blank">{{ resource.title }}</a>
            </li>
          </ul>
        </div>

        <div class="related-card">
          <h3>相关技术</h3>
          <div class="related-items">
            <div class="related-item" v-for="tech in language.relatedTech" :key="tech.id" @click="goToLanguage(tech.id)">
              <div class="related-icon">{{ tech.icon }}</div>
              <span>{{ tech.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="loading" v-else>加载中...</div>
</template>

<script>
export default {
  name: 'LanguageDetailView',
  data() {
    return {
      language: null,
      languages: {
        javascript: {
          id: 'javascript',
          name: 'JavaScript',
          icon: 'JS',
          categories: ['前端', '后端'],
          difficulty: 2,
          description: '网络开发的通用语言，前端开发的基础，也可用于后端和移动应用开发。',
          longDescription: 'JavaScript是一种高级的、解释型的编程语言，最初被设计用于为网页添加交互功能。如今，它已经成为Web开发的基础，并且通过Node.js拓展到了服务器端和其他应用领域。作为一种多范式的语言，JavaScript支持函数式编程、面向对象编程和事件驱动编程。',
          features: [
            { title: '动态类型', description: '变量类型在运行时确定，提供灵活性但需要更多注意' },
            { title: '函数式编程', description: '函数是一等公民，支持高阶函数、闭包等特性' },
            { title: '原型继承', description: '基于原型的对象系统，不同于传统的类继承' },
            { title: '异步编程', description: '通过回调、Promise和async/await处理异步操作' },
            { title: '事件驱动', description: '基于事件的编程模型，特别适合用户界面交互' }
          ],
          useCases: [
            { icon: '🌐', title: '网页开发', description: '创建交互性的网页应用，处理表单和用户交互' },
            { icon: '📱', title: '移动应用', description: '使用React Native或Ionic等框架开发跨平台移动应用' },
            { icon: '🖥️', title: '桌面应用', description: '通过Electron等技术构建跨平台桌面应用程序' },
            { icon: '🔙', title: '后端开发', description: '使用Node.js构建高性能的Web服务器和API' }
          ],
          codeExample: `// 现代JavaScript语法示例
const greeting = 'Hello, World!';
console.log(greeting);

// 使用箭头函数
const add = (a, b) => a + b;

// 使用Promise处理异步操作
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用async/await更现代的异步语法
async function getData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`,
          learningPath: [
            '掌握基础语法和数据类型',
            '学习DOM操作和事件处理',
            '深入理解函数和作用域',
            '熟悉异步编程(Promise, async/await)',
            '学习现代ES6+语法',
            '掌握常用框架(React, Vue等)'
          ],
          resources: [
            { title: 'MDN Web文档', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript' },
            { title: 'JavaScript.info', url: 'https://zh.javascript.info/' },
            { title: 'ES6入门教程', url: 'https://es6.ruanyifeng.com/' },
            { title: '现代JavaScript教程', url: 'https://zh.javascript.info/' }
          ],
          relatedTech: [
            { id: 'typescript', name: 'TypeScript', icon: 'TS' },
            { id: 'nodejs', name: 'Node.js', icon: 'NJ' },
            { id: 'react', name: 'React', icon: 'R' },
            { id: 'vue', name: 'Vue.js', icon: 'V' }
          ]
        }
      }
    }
  },
  mounted() {
    // 从URL中获取语言ID
    const languageId = this.$route.params.id;
    
    // 模拟API请求 - 实际使用中应该从API获取数据
    // 这里我们只提供了JavaScript的详细数据作为示例
    if (this.languages[languageId]) {
      this.language = this.languages[languageId];
    } else {
      // 如果找不到指定语言，创建一个简单的占位数据
      this.language = {
        id: languageId,
        name: languageId.charAt(0).toUpperCase() + languageId.slice(1),
        icon: languageId.substring(0, 2).toUpperCase(),
        categories: ['编程语言'],
        difficulty: 3,
        description: `这是${languageId}编程语言的详情页面。`,
        longDescription: '这里将包含该语言的详细介绍和历史背景。',
        features: [
          { title: '特性1', description: '该语言的核心特性1' },
          { title: '特性2', description: '该语言的核心特性2' }
        ],
        useCases: [
          { icon: '💻', title: '用例1', description: '该语言的主要应用场景1' },
          { icon: '📊', title: '用例2', description: '该语言的主要应用场景2' }
        ],
        codeExample: `// ${languageId} 代码示例
print("Hello, World!");`,
        learningPath: [
          '学习基础语法',
          '掌握核心概念',
          '实践项目开发'
        ],
        resources: [
          { title: '官方文档', url: '#' },
          { title: '推荐教程', url: '#' }
        ],
        relatedTech: [
          { id: 'javascript', name: 'JavaScript', icon: 'JS' }
        ]
      };
    }
  },
  methods: {
    goToLanguage(languageId) {
      this.$router.push(`/language/${languageId}`);
    }
  }
}
</script>