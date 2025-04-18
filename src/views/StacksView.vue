<template>
  <div class="stacks">
    <h1>技术栈</h1>
    <p class="subtitle">探索各种流行的技术组合和开发生态系统</p>
    
    <div class="search-container">
      <input type="text" placeholder="搜索技术栈..." v-model="searchQuery" />
      <button @click="search">搜索</button>
    </div>
    
    <div class="filter-container">
      <div class="filter-options">
        <span>筛选：</span>
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="{ active: selectedCategory === category.id }"
          @click="filterByCategory(category.id)">
          {{ category.name }}
        </button>
      </div>
    </div>
    
    <div class="stacks-grid">
      <div class="stack-card" v-for="stack in filteredStacks" :key="stack.id" @click="goToStack(stack.id)">
        <div class="stack-icon">{{ stack.icon }}</div>
        <h3>{{ stack.name }}</h3>
        <div class="stack-tags">
          <span v-for="tag in stack.tags" :key="tag">{{ tag }}</span>
        </div>
        <p>{{ stack.description }}</p>
        <div class="stack-footer">
          <div class="popularity" :class="'level-' + stack.popularity">
            流行度: {{ getPopularityText(stack.popularity) }}
          </div>
          <div class="learn-more">了解更多 →</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StacksView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      categories: [
        { id: 'all', name: '全部' },
        { id: 'frontend', name: '前端栈' },
        { id: 'backend', name: '后端栈' },
        { id: 'fullstack', name: '全栈' },
        { id: 'mobile', name: '移动开发' },
        { id: 'devops', name: 'DevOps' }
      ],
      stacks: [
        { 
          id: 'mern', 
          name: 'MERN Stack', 
          icon: '📱', 
          tags: ['全栈', 'JavaScript'],
          popularity: 4, 
          description: 'MongoDB, Express, React, Node.js 组成的JavaScript全栈开发技术栈。' 
        },
        { 
          id: 'lamp', 
          name: 'LAMP Stack', 
          icon: '💻', 
          tags: ['后端栈', 'PHP'], 
          popularity: 3,
          description: 'Linux, Apache, MySQL, PHP 组成的传统Web开发技术栈。' 
        },
        { 
          id: 'mean', 
          name: 'MEAN Stack', 
          icon: '🌐', 
          tags: ['全栈', 'JavaScript'], 
          popularity: 3,
          description: 'MongoDB, Express, Angular, Node.js 组成的JavaScript全栈开发技术栈。' 
        },
        { 
          id: 'jamstack', 
          name: 'JAMStack', 
          icon: '🚀', 
          tags: ['前端栈', '静态网站'], 
          popularity: 4,
          description: 'JavaScript, API, Markup 组成的现代静态网站开发技术栈。' 
        },
        { 
          id: 'lemp', 
          name: 'LEMP Stack', 
          icon: '🔧', 
          tags: ['后端栈', 'PHP'], 
          popularity: 3,
          description: 'Linux, Nginx, MySQL, PHP 组成的高性能Web开发技术栈。' 
        },
        { 
          id: 'mevn', 
          name: 'MEVN Stack', 
          icon: '🎨', 
          tags: ['全栈', 'JavaScript'], 
          popularity: 3,
          description: 'MongoDB, Express, Vue.js, Node.js 组成的JavaScript全栈开发技术栈。' 
        },
        { 
          id: 'dotnet', 
          name: '.NET Stack', 
          icon: '🔷', 
          tags: ['全栈', 'C#'], 
          popularity: 4,
          description: 'ASP.NET, C#, SQL Server 组成的微软生态系统全栈开发技术栈。' 
        },
        { 
          id: 'ruby-on-rails', 
          name: 'Ruby on Rails', 
          icon: '💎', 
          tags: ['全栈', 'Ruby'], 
          popularity: 3,
          description: 'Ruby, Rails, PostgreSQL 组成的全栈开发技术栈，以约定优于配置著称。' 
        },
        { 
          id: 'spring-boot', 
          name: 'Spring Boot', 
          icon: '☕', 
          tags: ['后端栈', 'Java'], 
          popularity: 5,
          description: 'Java, Spring Boot, Hibernate, MySQL 组成的企业级后端开发技术栈。' 
        },
        { 
          id: 'flask-python', 
          name: 'Flask + Python', 
          icon: '🐍', 
          tags: ['后端栈', 'Python'], 
          popularity: 4,
          description: 'Python, Flask, SQLAlchemy 组成的轻量级后端开发技术栈。' 
        }
      ]
    }
  },
  computed: {
    filteredStacks() {
      let result = this.stacks;
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(stack => 
          stack.name.toLowerCase().includes(query) || 
          stack.description.toLowerCase().includes(query)
        );
      }
      
      // 类别过滤
      if (this.selectedCategory !== 'all') {
        const category = this.categories.find(c => c.id === this.selectedCategory)?.name;
        if (category) {
          result = result.filter(stack => 
            stack.tags.includes(category)
          );
        }
      }
      
      return result;
    }
  },
  methods: {
    search() {
      console.log('搜索:', this.searchQuery);
    },
    filterByCategory(categoryId) {
      this.selectedCategory = categoryId;
    },
    goToStack(stackId) {
      this.$router.push(`/stack/${stackId}`);
    },
    getPopularityText(level) {
      const levels = ['非常低', '低', '中等', '高', '非常高'];
      return levels[level - 1] || '未知';
    }
  }
}
</script>