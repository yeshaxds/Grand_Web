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

<script>
import languageDetails from '@/data/languageDetails.json'

export default {
  name: 'LanguageDetailView',
  data() {
    return {
      language: null
    }
  },
  mounted() {
    // 从URL中获取语言ID
    const languageId = this.$route.params.id;

    // 从JSON数据中获取语言详情
    if (languageDetails[languageId]) {
      this.language = languageDetails[languageId];
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
      };
    }
  },
  methods: {
    goToLanguage(languageId) {
      // 检查目标语言是否存在于数据中
      if (languageDetails[languageId]) {
        this.$router.push(`/language/${languageId}`);
      } else {
        // 如果是跳转到相关技术而不是语言，可能需要不同的路由
        // 例如，对于像react这样的库/框架，可能需要跳转到技术栈页面
        if (languageId.includes('stack') || this.isFrameworkOrLibrary(languageId)) {
          this.$router.push(`/stack/${languageId}`);
          console.log(`导航到技术栈: ${languageId}`);
        } else {
          // 默认仍然使用语言路由
          this.$router.push(`/language/${languageId}`);
          console.log(`导航到语言: ${languageId}，但该语言可能不存在`);
        }
      }
    },

    // 检查ID是否是框架或库而不是语言
    isFrameworkOrLibrary(id) {
      // 这些ID可能是框架/库而不是语言
      const frameworksAndLibraries = [
        'react', 'vue', 'angular', 'nodejs', 'django',
        'flask', 'spring', 'hibernate', 'pandas', 'tensorflow',
        'docker', 'kubernetes', 'gin', 'grpc'
      ];
      return frameworksAndLibraries.includes(id);
    }
  }
}
</script>