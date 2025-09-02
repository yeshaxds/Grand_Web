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
            <div class="related-item" v-for="tech in language.relatedTech" :key="tech.id"
              @click="goToLanguage(tech.id)">
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

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import languageDetails from '@/data/languageDetails.json'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const language = ref(null)

// 技术栈路由映射
const techRouteMap = {
  // 前端框架和库 -> 技术栈路由
  'react': 'stack',
  'vue': 'stack',
  'angular': 'stack',
  'svelte': 'stack',

  // Node.js及相关 -> 技术栈路由
  'nodejs': 'stack',
  'express': 'stack',
  'nestjs': 'stack',

  // Python框架 -> 技术栈路由
  'django': 'stack',
  'flask': 'stack',
  'fastapi': 'stack',

  // Java框架 -> 技术栈路由
  'spring': 'stack',
  'hibernate': 'stack',

  // 数据科学/AI库 -> 技术栈路由
  'tensorflow': 'stack',
  'pytorch': 'stack',
  'pandas': 'stack',

  // 云原生/容器 -> 技术栈路由
  'docker': 'stack',
  'kubernetes': 'stack',
  'grpc': 'stack',
  'gin': 'stack',

  // 默认语言 -> 语言路由
  'javascript': 'language',
  'python': 'language',
  'java': 'language',
  'typescript': 'language',
  'go': 'language'
}

// 方法
const loadLanguageData = (languageId) => {
  // 从JSON数据中获取语言详情
  if (languageDetails[languageId]) {
    language.value = languageDetails[languageId]
  } else {
    // 如果找不到指定语言，创建一个简单的占位数据
    language.value = {
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
      codeExample: `// ${languageId} 代码示例\nprint("Hello, World!");`,
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
    }
  }
}

const goToLanguage = (languageId) => {
  // 获取该技术应使用的路由类型，默认为语言路由
  let routeType = techRouteMap[languageId] || 'language'

  // 如果ID包含stack，一定是技术栈
  if (languageId.includes('stack')) {
    routeType = 'stack'
  }

  // 根据路由类型进行导航
  if (routeType === 'stack') {
    router.push(`/stack/${languageId}`)
  } else {
    router.push(`/language/${languageId}`)
  }
}

// eslint-disable-next-line no-unused-vars
const isFrameworkOrLibrary = (id) => {
  const frameworksAndLibraries = [
    'react', 'vue', 'angular', 'nodejs', 'django',
    'flask', 'spring', 'hibernate', 'pandas', 'tensorflow',
    'docker', 'kubernetes', 'gin', 'grpc'
  ]
  return frameworksAndLibraries.includes(id)
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadLanguageData(newId)
    }
  },
  { immediate: true } // 初始加载时也执行
)
</script>

<style scoped>
.language-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.language-icon {
  font-size: 4rem;
  margin-right: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  min-width: 120px;
  text-align: center;
}

.header-content h1 {
  margin: 0 0 15px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.language-categories {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.language-categories span {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.main-content {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.main-content section {
  margin-bottom: 40px;
}

.main-content section:last-child {
  margin-bottom: 0;
}

.main-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8rem;
  border-bottom: 3px solid #e74c3c;
  padding-bottom: 10px;
}

.main-content p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 1.05rem;
}

.main-content ul {
  color: #555;
  line-height: 1.7;
}

.main-content li {
  margin-bottom: 10px;
  font-size: 1.05rem;
}

.use-case-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.use-case-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
}

.use-case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.use-case-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.use-case-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.use-case-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.code-block {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  line-height: 1.5;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.learning-path-card,
.resources-card,
.related-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.sidebar h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 8px;
}

.learning-path-card ol {
  color: #555;
  line-height: 1.6;
  padding-left: 20px;
}

.learning-path-card li {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.start-learning {
  width: 100%;
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.start-learning:hover {
  background-color: #c0392b;
}

.resources-card ul {
  list-style: none;
  padding: 0;
}

.resources-card li {
  margin-bottom: 10px;
}

.resources-card a {
  color: #3498db;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.resources-card a:hover {
  color: #e74c3c;
  text-decoration: underline;
}

.related-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.related-item:hover {
  background-color: #f8f9fa;
}

.related-icon {
  background-color: #e74c3c;
  color: white;
  border-radius: 6px;
  padding: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 35px;
  text-align: center;
}

.related-item span {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

@media (max-width: 968px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .language-detail {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    text-align: center;
    padding: 25px;
  }
  
  .language-icon {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .main-content,
  .learning-path-card,
  .resources-card,
  .related-card {
    padding: 20px;
  }
  
  .use-case-cards {
    grid-template-columns: 1fr;
  }
}
</style>