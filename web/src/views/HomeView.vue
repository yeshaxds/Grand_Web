<template>
  <div class="home">
    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 左侧广告栏 -->
      <div class="ad-sidebar ad-left">
        <div class="ad-content">
          <h3>精选课程</h3>
          <div class="ad-item">
            <div class="ad-emoji">📚</div>
            <p>高级JavaScript教程</p>
          </div>
          <div class="ad-item">
            <div class="ad-emoji">🐍</div>
            <p>Python数据分析</p>
          </div>
          <div class="ad-button">查看更多</div>
        </div>
      </div>

      <!-- 右侧广告栏 -->
      <div class="ad-sidebar ad-right">
        <div class="ad-content">
          <h3>推荐工具</h3>
          <div class="ad-item">
            <div class="ad-emoji">💻</div>
            <p>在线代码编辑器</p>
          </div>
          <div class="ad-item">
            <div class="ad-emoji">🔧</div>
            <p>开发者工具包</p>
          </div>
          <div class="ad-button">了解详情</div>
        </div>
      </div>

      <h1 class="title">代码学习中心</h1>
      <p class="subtitle">探索不同的编程语言和技术栈</p>

      <div class="search-container">
        <input 
          type="text" 
          placeholder="搜索技术或语言..." 
          v-model="searchQuery"
          @keyup.enter="search" 
        />
        <button @click="search">搜索</button>
      </div>

      <!-- 搜索结果显示区域 -->
      <div v-if="hasSearched" class="search-results">
        <h2>搜索结果 <span v-if="found_tools.length === 0">(未找到匹配项)</span></h2>
        <div v-if="found_tools.length > 0" class="search-results-grid">
          <div 
            class="search-result-card" 
            v-for="result in found_tools" 
            :key="result.id"
            @click="navigateToResult(result)"
          >
            <div class="result-icon">{{ result.icon }}</div>
            <div class="result-content">
              <h3>{{ result.name }}</h3>
              <p>{{ result.description }}</p>
              <span class="result-type">{{ result.type === 'language' ? '编程语言' : '技术栈' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!hasSearched || searchResults.length === 0" class="categories">
        <h2>热门编程语言</h2>
        <div class="language-grid">
          <div class="language-card" v-for="language in languages" :key="language.id"
            @click="goToLanguage(language.id)">
            <div class="language-icon">{{ language.icon }}</div>
            <h3>{{ language.name }}</h3>
            <p>{{ language.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="!hasSearched || searchResults.length === 0" class="categories">
        <h2>流行技术栈</h2>
        <div class="stack-grid">
          <div class="stack-card" v-for="stack in techStacks" :key="stack.id" @click="goToStack(stack.id)">
            <div class="stack-icon">{{ stack.icon }}</div>
            <h3>{{ stack.name }}</h3>
            <p>{{ stack.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="!hasSearched || searchResults.length === 0" class="learning-path">
        <h2>推荐学习路径</h2>
        <div class="path-steps">
          <div class="path-step" v-for="(step, index) in learningPath" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      searchQuery: '',
      hasSearched: false,
      searchResults: [],
      languages: [
        { id: 'javascript', name: 'JavaScript', icon: 'JS', description: '网络开发的通用语言，前端开发的基础', type: 'language' },
        { id: 'python', name: 'Python', icon: 'PY', description: '简洁易学的通用语言，适合数据科学和后端开发', type: 'language' },
        { id: 'java', name: 'Java', icon: 'JV', description: '强大的企业级编程语言，适合大型应用开发', type: 'language' },
        { id: 'go', name: 'Go', icon: 'GO', description: '高性能的现代语言，适合云原生和微服务开发', type: 'language' },
        { id: 'rust', name: 'Rust', icon: 'RS', description: '专注于安全性和性能的系统级语言', type: 'language' },
        { id: 'csharp', name: 'C#', icon: 'C#', description: '微软生态系统的主要语言，用于.NET开发', type: 'language' }
      ],
      techStacks: [
        { id: 'mern', name: 'MERN Stack', icon: '📱', description: 'MongoDB, Express, React, Node.js 全栈开发', type: 'stack' },
        { id: 'lamp', name: 'LAMP Stack', icon: '💻', description: 'Linux, Apache, MySQL, PHP 传统Web开发', type: 'stack' },
        { id: 'mean', name: 'MEAN Stack', icon: '🌐', description: 'MongoDB, Express, Angular, Node.js 全栈开发', type: 'stack' },
        { id: 'jamstack', name: 'JAMStack', icon: '🚀', description: 'JavaScript, API, Markup 现代静态站点开发', type: 'stack' }
      ],
      learningPath: [
        { title: '学习编程基础', description: '开始理解编程的核心概念和逻辑思维' },
        { title: '掌握一门语言', description: '深入学习一门主要编程语言及其生态系统' },
        { title: '了解前端开发', description: '学习HTML, CSS, JavaScript和现代前端框架' },
        { title: '探索后端开发', description: '学习服务器端编程、API设计和数据库' },
        { title: '构建完整项目', description: '整合所学知识，构建全栈应用程序' }
      ]
    }
  },
  computed: {
    found_tools(){
      let result = [...this.languages, ...this.techStacks];
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(lang => 
          lang.name.toLowerCase().includes(query) || 
          lang.description.toLowerCase().includes(query)
        );
      }



      return result;
    }
  },
  methods: {
    search() {
      if (!this.searchQuery.trim()) {
        this.hasSearched = false;
        this.searchResults = [];
        return;
      }
      
      // 设置搜索状态
      this.hasSearched = true;
      
      // 合并语言和技术栈数据
      const allItems = [...this.languages, ...this.techStacks];
      
      // 执行搜索逻辑 - 搜索名称和描述
      const query = this.searchQuery.toLowerCase();
      this.searchResults = allItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    },
    
    navigateToResult(result) {
      if (result.type === 'language') {
        this.goToLanguage(result.id);
      } else {
        this.goToStack(result.id);
      }
    },
    
    goToLanguage(languageId) {
      // 导航到特定语言的页面
      this.$router.push(`/language/${languageId}`);
    },
    
    goToStack(stackId) {
      // 导航到特定技术栈的页面
      this.$router.push(`/stack/${stackId}`);
    },
    
    clearSearch() {
      this.searchQuery = '';
      this.hasSearched = false;
      this.searchResults = [];
    }
  }
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

/* 背景图层已移至App.vue作为全局背景 */

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.search-container input {
  width: 60%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-container button {
  padding: 12px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 1rem;
}

/* 搜索结果样式 */
.search-results {
  margin-bottom: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-results h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #4285f4;
  padding-bottom: 10px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.search-result-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.search-result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.result-icon {
  font-size: 2rem;
  color: #4285f4;
  margin-right: 15px;
  align-self: center;
}

.result-content {
  flex: 1;
}

.result-content h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: #333;
}

.result-content p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.result-type {
  display: inline-block;
  background-color: #f0f5ff;
  color: #4285f4;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.categories {
  margin-bottom: 40px;
}

.categories h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #4285f4;
  padding-bottom: 10px;
}

.language-grid,
.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.language-card,
.stack-card {
  background-color: rgba(255, 255, 255, 0.9);
  /* 略微透明的背景 */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.language-card:hover,
.stack-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 1);
  /* 悬停时变为不透明 */
}

.language-icon,
.stack-icon {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #4285f4;
}

.language-card h3,
.stack-card h3 {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #333;
}

.language-card p,
.stack-card p {
  color: #666;
  font-size: 0.9rem;
}

.learning-path {
  background-color: rgba(255, 255, 255, 0.9);
  /* 略微透明的背景 */
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.path-steps {
  margin-top: 20px;
}

.path-step {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.step-number {
  background-color: #4285f4;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.2rem;
  margin-bottom: 5px;
  color: #333;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
}

/* 广告侧边栏样式 */
.ad-sidebar {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 180px;
  background-color: rgba(255, 255, 255, 0.9);
  /* 略微透明的背景 */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.ad-left {
  left: 10px;
}

.ad-right {
  right: 10px;
}

.ad-content {
  padding: 15px;
}

.ad-content h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 2px solid #4285f4;
  padding-bottom: 8px;
}

.ad-item {
  margin-bottom: 15px;
  text-align: center;
}

.ad-emoji {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.ad-item p {
  font-size: 0.9rem;
  color: #555;
}

.ad-button {
  background-color: #4285f4;
  color: white;
  text-align: center;
  padding: 8px 0;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.ad-button:hover {
  background-color: #3367d6;
}

/* 适应较小屏幕，隐藏广告栏 */
@media (max-width: 1400px) {
  .ad-sidebar {
    display: none;
  }
}
</style>