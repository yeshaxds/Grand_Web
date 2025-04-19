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

<script>
import resourceData from '@/data/resources.json'

export default {
  name: 'ResourcesView',
  data() {
    return {
      searchQuery: '',
      selectedType: 'all',
      selectedLevel: 'all',
      resourceData: resourceData,
      resourceTypes: resourceData.resourceTypes,
      difficultyLevels: resourceData.difficultyLevels,
      categories: resourceData.categories,
      resources: resourceData.resources
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
      
      // 难度过滤
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
    getResourcesByCategory(categoryId) {
      return this.resources.filter(resource => resource.category === categoryId);
    },
    getResourceTypeName(typeId) {
      const type = this.resourceTypes.find(t => t.id === typeId);
      return type ? type.name : '其他';
    },
    getDifficultyLevelName(levelId) {
      const level = this.difficultyLevels.find(l => l.id === levelId.toString());
      return level ? level.name : '未知难度';
    }
  }
}
</script>