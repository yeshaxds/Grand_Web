<template>
  <div class="languages">
    <h1>编程语言</h1>
    <p class="subtitle">探索各种编程语言及其特性</p>
    
    <div class="search-container">
      <input type="text" placeholder="搜索编程语言..." v-model="searchQuery" />
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
    
    <div class="languages-grid">
      <div class="language-card" v-for="language in filteredLanguages" :key="language.id" @click="goToLanguage(language.id)">
        <div class="language-icon">{{ language.icon }}</div>
        <h3>{{ language.name }}</h3>
        <div class="language-categories">
          <span v-for="tag in language.categories" :key="tag">{{ tag }}</span>
        </div>
        <p>{{ language.description }}</p>
        <div class="language-footer">
          <div class="difficulty" :class="'level-' + language.difficulty">
            难度: {{ getDifficultyText(language.difficulty) }}
          </div>
          <div class="learn-more">了解更多 →</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanguagesView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      categories: [
        { id: 'all', name: '全部' },
        { id: 'frontend', name: '前端' },
        { id: 'backend', name: '后端' },
        { id: 'mobile', name: '移动开发' },
        { id: 'system', name: '系统编程' },
        { id: 'database', name: '数据库' }
      ],
      languages: [
        { 
          id: 'javascript', 
          name: 'JavaScript', 
          icon: 'JS', 
          categories: ['前端', '后端'], 
          difficulty: 2,
          description: '网络开发的通用语言，前端开发的基础，也可用于后端和移动应用开发。' 
        },
        { 
          id: 'python', 
          name: 'Python', 
          icon: 'PY', 
          categories: ['后端', '数据科学'], 
          difficulty: 1,
          description: '简洁易学的通用语言，适合数据科学、AI、后端开发和自动化脚本。' 
        },
        { 
          id: 'java', 
          name: 'Java', 
          icon: 'JV', 
          categories: ['后端', '移动开发'], 
          difficulty: 3,
          description: '强大的企业级编程语言，用于Android应用、Web后端和大型系统开发。' 
        },
        { 
          id: 'csharp', 
          name: 'C#', 
          icon: 'C#', 
          categories: ['后端', '游戏开发'], 
          difficulty: 3,
          description: '微软生态系统的主要语言，用于.NET开发、Windows应用和Unity游戏开发。' 
        },
        { 
          id: 'go', 
          name: 'Go', 
          icon: 'GO', 
          categories: ['后端', '系统编程'], 
          difficulty: 2,
          description: '由Google开发的高性能语言，专为并发和云原生应用设计，简单高效。' 
        },
        { 
          id: 'rust', 
          name: 'Rust', 
          icon: 'RS', 
          categories: ['系统编程'], 
          difficulty: 4,
          description: '专注于安全性和性能的系统级语言，避免内存错误并保证线程安全。' 
        },
        { 
          id: 'typescript', 
          name: 'TypeScript', 
          icon: 'TS', 
          categories: ['前端', '后端'], 
          difficulty: 2,
          description: 'JavaScript的超集，添加了类型系统，提高代码质量和开发效率。' 
        },
        { 
          id: 'swift', 
          name: 'Swift', 
          icon: 'SW', 
          categories: ['移动开发'], 
          difficulty: 3,
          description: '由Apple开发的用于iOS、macOS应用开发的现代语言，安全高效。' 
        },
        { 
          id: 'kotlin', 
          name: 'Kotlin', 
          icon: 'KT', 
          categories: ['移动开发', '后端'], 
          difficulty: 2,
          description: '现代JVM语言，是Android官方开发语言，也可用于后端开发。' 
        },
        { 
          id: 'sql', 
          name: 'SQL', 
          icon: 'SQL', 
          categories: ['数据库'], 
          difficulty: 2,
          description: '用于管理关系型数据库的标准语言，处理数据查询和操作。' 
        }
      ]
    }
  },
  computed: {
    filteredLanguages() {
      let result = this.languages;
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(lang => 
          lang.name.toLowerCase().includes(query) || 
          lang.description.toLowerCase().includes(query)
        );
      }
      
      // 类别过滤
      if (this.selectedCategory !== 'all') {
        const category = this.categories.find(c => c.id === this.selectedCategory)?.name;
        if (category) {
          result = result.filter(lang => 
            lang.categories.includes(category)
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
    goToLanguage(languageId) {
      this.$router.push(`/language/${languageId}`);
    },
    getDifficultyText(level) {
      const levels = ['入门', '简单', '中等', '困难', '专家'];
      return levels[level - 1] || '未知';
    }
  }
}
</script> 