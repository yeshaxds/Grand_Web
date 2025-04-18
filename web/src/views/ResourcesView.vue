<template>
  <div class="resources">
    <h1>学习资源</h1>
    <p class="subtitle">精选的编程学习资源，助您掌握各种技术</p>
    
    <div class="search-container">
      <input type="text" placeholder="搜索学习资源..." v-model="searchQuery" />
      <button @click="search">搜索</button>
    </div>
    
    <div class="filter-container">
      <div class="filter-options">
        <span>资源类型：</span>
        <button 
          v-for="type in resourceTypes" 
          :key="type.id"
          :class="{ active: selectedType === type.id }"
          @click="filterByType(type.id)">
          {{ type.name }}
        </button>
      </div>
      <div class="filter-options">
        <span>难度级别：</span>
        <button 
          v-for="level in difficultyLevels" 
          :key="level.id"
          :class="{ active: selectedLevel === level.id }"
          @click="filterByLevel(level.id)">
          {{ level.name }}
        </button>
      </div>
    </div>
    
    <div class="resources-grid">
      <div class="resource-card" v-for="resource in filteredResources" :key="resource.id">
        <div class="resource-header">
          <div class="resource-icon">{{ resource.icon }}</div>
          <div class="resource-tags">
            <span class="resource-type">{{ getResourceTypeName(resource.type) }}</span>
            <span class="resource-level" :class="'level-' + resource.level">{{ getDifficultyLevelName(resource.level) }}</span>
          </div>
        </div>
        <h3>{{ resource.title }}</h3>
        <p class="resource-author">{{ resource.author }}</p>
        <p class="resource-description">{{ resource.description }}</p>
        <div class="resource-footer">
          <div class="resource-meta">
            <span class="resource-language">{{ resource.language }}</span>
            <span class="resource-rating">★ {{ resource.rating }}/5</span>
          </div>
          <a :href="resource.url" target="_blank" class="resource-link">立即学习</a>
        </div>
      </div>
    </div>
    
    <div class="resources-section" v-for="category in categories" :key="category.id">
      <h2>{{ category.name }}</h2>
      <div class="resource-list">
        <div class="resource-list-item" v-for="resource in getResourcesByCategory(category.id)" :key="resource.id">
          <div class="resource-list-icon">{{ resource.icon }}</div>
          <div class="resource-list-content">
            <h3>{{ resource.title }}</h3>
            <p class="resource-list-description">{{ resource.description }}</p>
            <div class="resource-list-meta">
              <span class="resource-type">{{ getResourceTypeName(resource.type) }}</span>
              <span class="resource-level" :class="'level-' + resource.level">{{ getDifficultyLevelName(resource.level) }}</span>
              <span class="resource-language">{{ resource.language }}</span>
              <span class="resource-rating">★ {{ resource.rating }}/5</span>
            </div>
          </div>
          <a :href="resource.url" target="_blank" class="resource-list-link">查看</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourcesView',
  data() {
    return {
      searchQuery: '',
      selectedType: 'all',
      selectedLevel: 'all',
      resourceTypes: [
        { id: 'all', name: '全部' },
        { id: 'tutorial', name: '教程' },
        { id: 'course', name: '课程' },
        { id: 'book', name: '书籍' },
        { id: 'documentation', name: '文档' },
        { id: 'video', name: '视频' },
        { id: 'article', name: '文章' }
      ],
      difficultyLevels: [
        { id: 'all', name: '全部难度' },
        { id: '1', name: '入门' },
        { id: '2', name: '初级' },
        { id: '3', name: '中级' },
        { id: '4', name: '高级' },
        { id: '5', name: '专家' }
      ],
      categories: [
        { id: 'frontend', name: '前端开发' },
        { id: 'backend', name: '后端开发' },
        { id: 'mobile', name: '移动开发' },
        { id: 'database', name: '数据库' },
        { id: 'devops', name: 'DevOps' }
      ],
      resources: [
        {
          id: 1,
          title: 'MDN Web 文档',
          author: 'Mozilla',
          description: '全面的Web开发文档，涵盖HTML、CSS和JavaScript等前端技术。',
          icon: '📚',
          type: 'documentation',
          level: 1,
          language: '多语言',
          category: 'frontend',
          rating: 4.9,
          url: 'https://developer.mozilla.org/'
        },
        {
          id: 2,
          title: 'React 官方文档',
          author: 'Facebook',
          description: 'React库的官方文档，包含完整的API参考和教程。',
          icon: '⚛️',
          type: 'documentation',
          level: 2,
          language: '多语言',
          category: 'frontend',
          rating: 4.8,
          url: 'https://reactjs.org/'
        },
        {
          id: 3,
          title: 'Vue.js 官方指南',
          author: 'Vue团队',
          description: 'Vue.js框架的官方指南，从入门到进阶的全面教程。',
          icon: '🟩',
          type: 'documentation',
          level: 2,
          language: '多语言',
          category: 'frontend',
          rating: 4.9,
          url: 'https://vuejs.org/'
        },
        {
          id: 4,
          title: 'Node.js 入门教程',
          author: 'Node.js基金会',
          description: '从零开始学习Node.js后端开发的综合教程。',
          icon: '🟢',
          type: 'tutorial',
          level: 1,
          language: '英文',
          category: 'backend',
          rating: 4.6,
          url: 'https://nodejs.org/en/learn/'
        },
        {
          id: 5,
          title: 'Spring Boot 实战',
          author: 'Craig Walls',
          description: '学习如何使用Spring Boot快速构建企业级Java应用。',
          icon: '☕',
          type: 'book',
          level: 3,
          language: '中文',
          category: 'backend',
          rating: 4.7,
          url: '#'
        },
        {
          id: 6,
          title: 'Python数据科学手册',
          author: 'Jake VanderPlas',
          description: '使用Python进行数据分析和科学计算的综合指南。',
          icon: '🐍',
          type: 'book',
          level: 3,
          language: '英文',
          category: 'backend',
          rating: 4.8,
          url: '#'
        },
        {
          id: 7,
          title: 'Flutter实战',
          author: 'Google团队',
          description: '使用Flutter框架构建跨平台移动应用的实用指南。',
          icon: '📱',
          type: 'course',
          level: 2,
          language: '中文',
          category: 'mobile',
          rating: 4.5,
          url: '#'
        },
        {
          id: 8,
          title: 'iOS开发教程',
          author: 'Apple',
          description: '从入门到精通iOS应用开发的官方教程。',
          icon: '🍎',
          type: 'documentation',
          level: 3,
          language: '英文',
          category: 'mobile',
          rating: 4.7,
          url: 'https://developer.apple.com/tutorials/swiftui'
        },
        {
          id: 9,
          title: 'SQL基础教程',
          author: 'W3Schools',
          description: '全面的SQL语言入门教程，适合数据库初学者。',
          icon: '💾',
          type: 'tutorial',
          level: 1,
          language: '英文',
          category: 'database',
          rating: 4.5,
          url: 'https://www.w3schools.com/sql/'
        },
        {
          id: 10,
          title: 'MongoDB大学',
          author: 'MongoDB Inc.',
          description: '官方提供的MongoDB数据库课程，从基础到高级。',
          icon: '🍃',
          type: 'course',
          level: 2,
          language: '英文',
          category: 'database',
          rating: 4.6,
          url: 'https://university.mongodb.com/'
        },
        {
          id: 11,
          title: 'Docker完全指南',
          author: 'Docker Inc.',
          description: '从零开始学习Docker容器化技术的完整指南。',
          icon: '🐳',
          type: 'tutorial',
          level: 2,
          language: '英文',
          category: 'devops',
          rating: 4.8,
          url: 'https://docs.docker.com/get-started/'
        },
        {
          id: 12,
          title: 'Kubernetes入门到实践',
          author: 'Kubernetes团队',
          description: '全面学习Kubernetes容器编排平台的权威教程。',
          icon: '⎈',
          type: 'course',
          level: 4,
          language: '英文',
          category: 'devops',
          rating: 4.9,
          url: 'https://kubernetes.io/docs/tutorials/'
        }
      ]
    }
  },
  computed: {
    filteredResources() {
      let result = this.resources;
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.author.toLowerCase().includes(query)
        );
      }
      
      // 类型过滤
      if (this.selectedType !== 'all') {
        result = result.filter(resource => resource.type === this.selectedType);
      }
      
      // 难度级别过滤
      if (this.selectedLevel !== 'all') {
        result = result.filter(resource => resource.level.toString() === this.selectedLevel);
      }
      
      return result;
    }
  },
  methods: {
    search() {
      console.log('搜索:', this.searchQuery);
    },
    filterByType(typeId) {
      this.selectedType = typeId;
    },
    filterByLevel(levelId) {
      this.selectedLevel = levelId;
    },
    getResourceTypeName(typeId) {
      const type = this.resourceTypes.find(t => t.id === typeId);
      return type ? type.name : typeId;
    },
    getDifficultyLevelName(levelId) {
      const level = this.difficultyLevels.find(l => l.id === levelId.toString());
      return level ? level.name : '未知';
    },
    getResourcesByCategory(categoryId) {
      return this.resources
        .filter(resource => resource.category === categoryId)
        .slice(0, 4); // 每个分类最多显示4个资源
    }
  }
}
</script> 