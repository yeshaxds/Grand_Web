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

<script>
import stacksData from '@/data/stacks.json'

export default {
  name: 'StacksView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      categories: stacksData.categories,
      stacks: stacksData.stacks
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