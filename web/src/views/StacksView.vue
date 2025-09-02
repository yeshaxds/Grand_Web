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
        <button v-for="category in categories" :key="category.id" :class="{ active: selectedCategory === category.id }"
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

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import stacksData from '@/data/stacks.json'

// 路由
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')

// 静态数据 - 从JSON文件加载
const categories = ref(stacksData.categories)
const stacks = ref(stacksData.stacks)

// 计算属性
const filteredStacks = computed(() => {
  let result = stacks.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(stack =>
      stack.name.toLowerCase().includes(query) ||
      stack.description.toLowerCase().includes(query)
    )
  }

  // 类别过滤
  if (selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.id === selectedCategory.value)?.name
    if (category) {
      result = result.filter(stack =>
        stack.tags.includes(category)
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

const goToStack = (stackId) => {
  router.push(`/stack/${stackId}`)
}

const getPopularityText = (level) => {
  const levels = ['非常低', '低', '中等', '高', '非常高']
  return levels[level - 1] || '未知'
}
</script>

<style scoped>
.stacks {
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

.stacks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.stack-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.stack-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #e74c3c;
}

.stack-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 15px;
  color: #e74c3c;
}

.stack-card h3 {
  color: #2c3e50;
  text-align: center;
  margin: 0 0 15px 0;
  font-size: 1.4rem;
}

.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 15px;
}

.stack-tags span {
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.stack-card p {
  color: #555;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.stack-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popularity {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-1 {
  background-color: #fadbd8;
  color: #e74c3c;
}

.level-2 {
  background-color: #fef9e7;
  color: #f39c12;
}

.level-3 {
  background-color: #ebf3fd;
  color: #3498db;
}

.level-4 {
  background-color: #d5f4e6;
  color: #27ae60;
}

.level-5 {
  background-color: #e8f5e8;
  color: #2ecc71;
}

.learn-more {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stacks {
    padding: 15px;
  }
  
  .search-container input {
    width: 70%;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 15px;
  }
  
  .stacks-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stack-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>