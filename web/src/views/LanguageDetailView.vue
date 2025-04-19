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
  watch: {
    // 监听路由参数变化
    '$route.params.id': {
      immediate: true, // 初始加载时也执行
      handler(newId) {
        this.loadLanguageData(newId);
      }
    }
  },
  mounted() {
    // 初始加载由watch处理
  },
  methods: {
    // 提取数据加载逻辑到单独的方法
    loadLanguageData(languageId) {
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
    goToLanguage(languageId) {
      // 为常见的相关技术定义更合适的路由规则
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
      };

      // 获取该技术应使用的路由类型，默认为语言路由
      let routeType = techRouteMap[languageId] || 'language';

      // 如果ID包含stack，一定是技术栈
      if (languageId.includes('stack')) {
        routeType = 'stack';
      }

      // 根据路由类型进行导航
      if (routeType === 'stack') {
        this.$router.push(`/stack/${languageId}`);
      } else {
        this.$router.push(`/language/${languageId}`);
      }
    },

    // 此方法现已被更完整的导航逻辑替代
    isFrameworkOrLibrary(id) {
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