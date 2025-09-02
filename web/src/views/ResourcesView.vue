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
        <button v-for="type in resourceTypes" :key="type.id" :class="{ active: selectedType === type.id }"
          @click="filterByType(type.id)">
          {{ type.name }}
        </button>
      </div>
      <div class="filter-options">
        <span>难度级别：</span>
        <button v-for="level in difficultyLevels" :key="level.id" :class="{ active: selectedLevel === level.id }"
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
            <span class="resource-level" :class="'level-' + resource.level">{{ getDifficultyLevelName(resource.level)
            }}</span>
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
              <span class="resource-level" :class="'level-' + resource.level">{{ getDifficultyLevelName(resource.level)
              }}</span>
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

<script setup>
import { ref, computed } from 'vue'
import resourceData from '@/data/resources.json'

// 响应式数据
const searchQuery = ref('')
const selectedType = ref('all')
const selectedLevel = ref('all')

// 静态数据 - 从JSON文件加载
const resourceTypes = ref(resourceData.resourceTypes)
const difficultyLevels = ref(resourceData.difficultyLevels)
const categories = ref(resourceData.categories)
const resources = ref(resourceData.resources)

// 计算属性
const filteredResources = computed(() => {
  let result = resources.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(resource => 
      resource.title.toLowerCase().includes(query) || 
      resource.description.toLowerCase().includes(query) ||
      resource.author.toLowerCase().includes(query)
    )
  }
  
  // 类型过滤
  if (selectedType.value !== 'all') {
    result = result.filter(resource => resource.type === selectedType.value)
  }
  
  // 难度过滤
  if (selectedLevel.value !== 'all') {
    result = result.filter(resource => resource.level.toString() === selectedLevel.value)
  }
  
  return result
})

// 方法
const search = () => {
  console.log('搜索:', searchQuery.value)
}

const filterByType = (typeId) => {
  selectedType.value = typeId
}

const filterByLevel = (levelId) => {
  selectedLevel.value = levelId
}

const getResourcesByCategory = (categoryId) => {
  return resources.value.filter(resource => resource.category === categoryId)
}

const getResourceTypeName = (typeId) => {
  const type = resourceTypes.value.find(t => t.id === typeId)
  return type ? type.name : '其他'
}

const getDifficultyLevelName = (levelId) => {
  const level = difficultyLevels.value.find(l => l.id === levelId.toString())
  return level ? level.name : '未知难度'
}
</script>

<style scoped>
.resources {
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
  border-color: #e74c3c;
}

.search-container button {
  padding: 12px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.search-container button:hover {
  background-color: #c0392b;
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
  margin-bottom: 15px;
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
  border-color: #e74c3c;
  color: #e74c3c;
}

.filter-options button.active {
  background-color: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.resource-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #e74c3c;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.resource-icon {
  font-size: 2rem;
  color: #e74c3c;
}

.resource-tags {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.resource-type,
.resource-level {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.resource-type {
  background-color: #3498db;
  color: white;
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

.resource-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  line-height: 1.3;
}

.resource-author {
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
}

.resource-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.resource-language,
.resource-rating {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.resource-rating {
  color: #f39c12;
  font-weight: 600;
}

.resource-link {
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.resource-link:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.resources-section {
  margin: 50px 0;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
}

.resources-section h2 {
  color: #2c3e50;
  border-bottom: 3px solid #e74c3c;
  padding-bottom: 10px;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-list-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.resource-list-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-list-icon {
  font-size: 2.5rem;
  color: #e74c3c;
  flex-shrink: 0;
}

.resource-list-content {
  flex: 1;
}

.resource-list-content h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.resource-list-description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.resource-list-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.resource-list-meta span {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.resource-list-link {
  background-color: #e74c3c;
  color: white;
  padding: 12px 20px;
  border-radius: 15px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
  flex-shrink: 0;
  align-self: flex-start;
}

.resource-list-link:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .resources {
    padding: 15px;
  }
  
  .search-container input {
    width: 70%;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 15px;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .resource-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .resource-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .resource-list-item {
    flex-direction: column;
    text-align: center;
  }
  
  .resource-list-meta {
    justify-content: center;
  }
}
</style>