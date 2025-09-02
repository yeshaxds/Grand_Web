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

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 使用路由
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')

// 静态数据
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'frontend', name: '前端' },
  { id: 'backend', name: '后端' },
  { id: 'mobile', name: '移动开发' },
  { id: 'system', name: '系统编程' },
  { id: 'database', name: '数据库' }
])

const languages = ref([
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
])

// 计算属性
const filteredLanguages = computed(() => {
  let result = languages.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(lang => 
      lang.name.toLowerCase().includes(query) || 
      lang.description.toLowerCase().includes(query)
    )
  }
  
  // 类别过滤
  if (selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.id === selectedCategory.value)?.name
    if (category) {
      result = result.filter(lang => 
        lang.categories.includes(category)
      )
    }
  }
  
  return result
})

// 方法
const search = () => {
  console.log('搜索:', searchQuery.value)
}

const filterByCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const goToLanguage = (languageId) => {
  router.push(`/language/${languageId}`)
}

const getDifficultyText = (level) => {
  const levels = ['入门', '简单', '中等', '困难', '专家']
  return levels[level - 1] || '未知'
}
</script>

<style scoped>
.languages {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1.2rem;
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.search-container input {
  width: 60%;
  max-width: 400px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px 0 0 6px;
  font-size: 1rem;
  outline: none;
}

.search-container input:focus {
  border-color: #3498db;
}

.search-container button {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.search-container button:hover {
  background-color: #2980b9;
}

.filter-container {
  margin-bottom: 30px;
  text-align: center;
}

.filter-options {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-options span {
  font-weight: 600;
  color: #2c3e50;
}

.filter-options button {
  padding: 8px 16px;
  border: 2px solid #ecf0f1;
  background-color: white;
  color: #7f8c8d;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.filter-options button:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-options button.active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.language-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.language-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.language-icon {
  display: inline-block;
  width: 60px;
  height: 60px;
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.language-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.4rem;
}

.language-categories {
  margin-bottom: 15px;
}

.language-categories span {
  display: inline-block;
  background-color: #ecf0f1;
  color: #7f8c8d;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 8px;
  margin-bottom: 5px;
}

.language-card p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.language-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-1 {
  background-color: #d5f4e6;
  color: #27ae60;
}

.level-2 {
  background-color: #fef9e7;
  color: #f39c12;
}

.level-3 {
  background-color: #fadbd8;
  color: #e74c3c;
}

.level-4 {
  background-color: #d5dbdb;
  color: #34495e;
}

.learn-more {
  color: #3498db;
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .languages {
    padding: 15px;
  }
  
  .search-container input {
    width: 70%;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 15px;
  }
  
  .languages-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .language-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 