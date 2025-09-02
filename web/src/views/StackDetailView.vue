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

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import stackDetails from '@/data/stackDetails.json'
import { getRandomQuote } from '@/data/motivationalQuotes.js'

// 响应式数据
const stack = ref(null)
const randomQuote = ref({ text: '', author: '' })

// 路由相关
const route = useRoute()
const router = useRouter()

// 创建占位数据的辅助方法
const createPlaceholderStack = (stackId) => {
  // 为常见的框架和库提供基本信息
  const commonTechInfo = {
    'react': {
      name: 'React',
      icon: '⚛️',
      tags: ['前端框架', 'JavaScript'],
      description: 'React是一个用于构建用户界面的JavaScript库，由Facebook开发和维护。',
      longDescription: 'React是一个用于构建用户界面的JavaScript库，专注于组件化开发。它使用虚拟DOM来提高性能，支持JSX语法，并且拥有庞大的生态系统。React被广泛用于开发单页应用和移动应用。'
    },
    'vue': {
      name: 'Vue.js',
      icon: '🟩',
      tags: ['前端框架', 'JavaScript'],
      description: 'Vue.js是一个渐进式JavaScript框架，用于构建用户界面。',
      longDescription: 'Vue.js是一个渐进式的JavaScript框架，可以逐步集成到项目中。它提供响应式数据绑定和组件化的视图结构，拥有简洁的API和灵活的生态系统。Vue.js特别适合中小型项目和快速原型开发。'
    },
    'angular': {
      name: 'Angular',
      icon: '🔺',
      tags: ['前端框架', 'TypeScript'],
      description: 'Angular是一个由Google开发的TypeScript框架，用于构建企业级Web应用。',
      longDescription: 'Angular是一个完整的前端框架，提供了从路由到状态管理的全套解决方案。它基于TypeScript，使用组件化架构，并内置了很多开发大型应用的工具和模式。Angular在企业级应用开发中尤为流行。'
    },
    'nodejs': {
      name: 'Node.js',
      icon: '🟢',
      tags: ['后端运行时', 'JavaScript'],
      description: 'Node.js是一个基于Chrome V8引擎的JavaScript运行时环境。',
      longDescription: 'Node.js允许在服务器端运行JavaScript代码，使用事件驱动、非阻塞I/O模型，使其轻量且高效。Node.js的包生态系统npm是世界上最大的开源库生态系统，为开发者提供了丰富的工具和模块。'
    },
    'django': {
      name: 'Django',
      icon: '🦄',
      tags: ['后端框架', 'Python'],
      description: 'Django是一个高级Python Web框架，鼓励快速开发和简洁的设计。',
      longDescription: 'Django遵循"电池包含"的理念，提供了开发Web应用所需的大部分功能，如ORM、模板系统、表单处理等。它注重安全性和可扩展性，适合从小型网站到大型Web应用的各种项目。'
    },
    'flask': {
      name: 'Flask',
      icon: '🧪',
      tags: ['后端框架', 'Python'],
      description: 'Flask是一个轻量级的Python Web框架，简单灵活，适合小型应用和API开发。',
      longDescription: 'Flask是一个"微框架"，核心简单但可扩展性强。它不强制特定的项目结构或依赖，开发者可以自由选择所需的组件和库。Flask特别适合API开发、微服务和需要定制化的Web应用。'
    }
  }

  // 获取预定义技术的信息或创建通用占位符
  const techInfo = commonTechInfo[stackId] || {
    name: stackId.charAt(0).toUpperCase() + stackId.slice(1),
    icon: '🧩',
    tags: ['技术框架/库'],
    description: `这是${stackId}的详情页面。`,
    longDescription: '目前我们还没有这个技术的详细信息。我们将尽快添加更多内容。'
  }

  // 创建完整的占位数据结构
  return {
    id: stackId,
    name: techInfo.name,
    icon: techInfo.icon,
    tags: techInfo.tags,
    popularity: 3,
    description: techInfo.description,
    longDescription: techInfo.longDescription,
    components: [
      { name: '组件1', icon: '📦', description: '该技术的核心组件1' },
      { name: '组件2', icon: '🔌', description: '该技术的核心组件2' }
    ],
    advantages: [
      { icon: '✅', title: '优势1', description: '该技术的主要优势1' },
      { icon: '🚀', title: '优势2', description: '该技术的主要优势2' }
    ],
    codeExample: `// ${stackId} 示例代码\nconsole.log("Hello from ${techInfo.name}!");`,
    stats: {
      github: '未知',
      jobs: '未知',
      community: '未知'
    },
    learningPath: [
      '学习基础概念',
      '掌握核心功能',
      '构建简单应用',
      '深入高级特性'
    ],
    resources: [
      { title: '官方文档', url: '#' },
      { title: '入门教程', url: '#' }
    ],
    relatedStacks: []
  }
}

// 数据加载逻辑
const loadStackData = (stackId) => {
  // 从JSON数据中获取技术栈详情
  if (stackDetails[stackId]) {
    stack.value = stackDetails[stackId]
  } else {
    // 如果找不到指定技术栈，创建一个更完整的占位数据
    stack.value = createPlaceholderStack(stackId)
  }
}

// 路由导航方法
const goToStack = (stackId) => {
  router.push(`/stack/${stackId}`)
}

// 流行度文本转换
const getPopularityText = (level) => {
  const levels = ['非常低', '低', '中等', '高', '非常高']
  return levels[level - 1] || '未知'
}

// 刷新励志语句
const refreshQuote = () => {
  randomQuote.value = getRandomQuote()
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadStackData(newId)
    }
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(() => {
  // 获取随机励志语句
  randomQuote.value = getRandomQuote()
})
</script>