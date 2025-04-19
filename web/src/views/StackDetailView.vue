<template>
  <div class="stack-detail" v-if="stack">
    <div class="header">
      <div class="stack-icon">{{ stack.icon }}</div>
      <div class="header-content">
        <h1>{{ stack.name }}</h1>
        <div class="stack-tags">
          <span v-for="tag in stack.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-content">
        <section class="overview">
          <h2>概述</h2>
          <p>{{ stack.description }}</p>
          <p>{{ stack.longDescription }}</p>
        </section>

        <section class="components">
          <h2>组成部分</h2>
          <div class="component-cards">
            <div class="component-card" v-for="(component, index) in stack.components" :key="index">
              <div class="component-icon">{{ component.icon }}</div>
              <div class="component-content">
                <h3>{{ component.name }}</h3>
                <p>{{ component.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="advantages">
          <h2>优势与适用场景</h2>
          <div class="advantages-grid">
            <div class="advantage-card" v-for="(advantage, index) in stack.advantages" :key="index">
              <div class="advantage-icon">{{ advantage.icon }}</div>
              <h3>{{ advantage.title }}</h3>
              <p>{{ advantage.description }}</p>
            </div>
          </div>
        </section>

        <section class="code-example">
          <h2>示例架构</h2>
          <div class="code-block">
            <pre><code>{{ stack.codeExample }}</code></pre>
          </div>
        </section>
      </div>

      <div class="sidebar">
        <div class="quote-card">
          <h3>今日激励</h3>
          <div class="quote-content">
            <p class="quote-text">"{{ randomQuote.text }}"</p>
            <p class="quote-author">— {{ randomQuote.author }}</p>
          </div>
          <button class="refresh-quote" @click="refreshQuote">换一条</button>
        </div>

        <div class="popularity-card">
          <h3>流行度</h3>
          <div class="popularity-meter">
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: (stack.popularity * 20) + '%' }"></div>
            </div>
            <div class="meter-label">{{ getPopularityText(stack.popularity) }}</div>
          </div>
          <div class="popularity-stats">
            <div class="stat-item">
              <span class="stat-label">GitHub使用率</span>
              <span class="stat-value">{{ stack.stats?.github || 'N/A' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">职位需求</span>
              <span class="stat-value">{{ stack.stats?.jobs || 'N/A' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">社区支持</span>
              <span class="stat-value">{{ stack.stats?.community || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="learning-path-card">
          <h3>学习路径</h3>
          <ol>
            <li v-for="(step, index) in stack.learningPath" :key="index">
              {{ step }}
            </li>
          </ol>
          <button class="start-learning">开始学习</button>
        </div>

        <div class="resources-card">
          <h3>相关资源</h3>
          <ul>
            <li v-for="(resource, index) in stack.resources" :key="index">
              <a :href="resource.url" target="_blank">{{ resource.title }}</a>
            </li>
          </ul>
        </div>

        <div class="related-card">
          <h3>相关技术栈</h3>
          <div class="related-items">
            <div class="related-item" v-for="relatedStack in stack.relatedStacks" :key="relatedStack.id"
              @click="goToStack(relatedStack.id)">
              <div class="related-icon">{{ relatedStack.icon }}</div>
              <span>{{ relatedStack.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="loading" v-else>加载中...</div>
</template>

<script>
import stackDetails from '@/data/stackDetails.json'
import { getRandomQuote } from '@/data/motivationalQuotes.js'

export default {
  name: 'StackDetailView',
  data() {
    return {
      stack: null,
      randomQuote: { text: '', author: '' }
    }
  },
  mounted() {
    // 从URL中获取技术栈ID
    const stackId = this.$route.params.id;

    // 从JSON数据中获取技术栈详情
    if (stackDetails[stackId]) {
      this.stack = stackDetails[stackId];
    } else {
      // 如果找不到指定技术栈，创建一个简单的占位数据
      this.stack = {
        id: stackId,
        name: stackId.toUpperCase() + ' Stack',
        icon: '🔧',
        tags: ['技术栈'],
        popularity: 3,
        description: `这是${stackId.toUpperCase()}技术栈的详情页面。`,
        longDescription: '这里将包含该技术栈的详细介绍和历史背景。',
        components: [
          { name: '组件1', icon: '📦', description: '该技术栈的核心组件1' },
          { name: '组件2', icon: '🔌', description: '该技术栈的核心组件2' }
        ],
        advantages: [
          { icon: '✅', title: '优势1', description: '该技术栈的主要优势1' },
          { icon: '🚀', title: '优势2', description: '该技术栈的主要优势2' }
        ],
        codeExample: `// ${stackId} 技术栈示例代码\nconsole.log("Hello from ${stackId} stack!");`,
        stats: {
          github: '未知',
          jobs: '未知',
          community: '未知'
        },
        learningPath: [
          '学习基础概念',
          '掌握核心组件',
          '构建简单应用',
          '深入高级特性'
        ],
        resources: [
          { title: '官方文档', url: '#' },
          { title: '入门教程', url: '#' }
        ],
        relatedStacks: []
      };
    }

    // 获取随机励志语句
    this.randomQuote = getRandomQuote();
  },
  methods: {
    goToStack(stackId) {
      this.$router.push(`/stack/${stackId}`);
    },
    getPopularityText(level) {
      const levels = ['非常低', '低', '中等', '高', '非常高'];
      return levels[level - 1] || '未知';
    },
    refreshQuote() {
      this.randomQuote = getRandomQuote();
    }
  }
}
</script>