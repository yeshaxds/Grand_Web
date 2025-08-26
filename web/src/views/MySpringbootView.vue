<template>
  <div class="springboot-container">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1>🚀 SpringBoot 后端演示</h1>
      <p>展示SpringBoot框架的核心功能和API接口</p>
    </header>

    <!-- 服务状态检查 -->
    <section class="server-status">
      <div class="status-card">
        <h3>📡 服务器状态</h3>
        <div class="status-indicator" :class="{ 'online': serverOnline, 'offline': !serverOnline }">
          <span class="status-dot"></span>
          {{ serverOnline ? '在线' : '离线' }}
        </div>
        <button @click="checkServerStatus" class="btn btn-primary">检查状态</button>
      </div>
    </section>

    <!-- 功能导航 -->
    <nav class="feature-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="{ 'active': activeTab === tab.id }"
        class="nav-btn"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </nav>

    <!-- 内容区域 -->
    <main class="content-area">
      <!-- 系统信息 -->
      <div v-show="activeTab === 'system'" class="tab-content">
        <div class="info-grid">
          <div class="info-card">
            <h4>🖥️ 应用信息</h4>
            <div v-if="systemInfo" class="info-content">
              <p><strong>应用名称:</strong> {{ systemInfo.appName }}</p>
              <p><strong>版本:</strong> {{ systemInfo.version }}</p>
              <p><strong>描述:</strong> {{ systemInfo.description }}</p>
              <p><strong>Java版本:</strong> {{ systemInfo.javaVersion }}</p>
              <p><strong>服务端口:</strong> {{ systemInfo.serverPort }}</p>
              <p><strong>API前缀:</strong> {{ systemInfo.contextPath }}</p>
            </div>
            <button @click="loadSystemInfo" class="btn btn-secondary">刷新信息</button>
          </div>

          <div class="info-card">
            <h4>💾 数据库信息</h4>
            <div v-if="databaseInfo" class="info-content">
              <p><strong>驱动:</strong> {{ databaseInfo.driverClassName }}</p>
              <p><strong>URL:</strong> {{ databaseInfo.url }}</p>
              <p><strong>用户名:</strong> {{ databaseInfo.username }}</p>
              <p><strong>H2控制台:</strong> {{ databaseInfo.h2ConsoleEnabled ? '启用' : '禁用' }}</p>
              <p><strong>显示SQL:</strong> {{ databaseInfo.jpaShowSql ? '是' : '否' }}</p>
            </div>
            <button @click="loadDatabaseInfo" class="btn btn-secondary">刷新信息</button>
          </div>

          <div class="info-card">
            <h4>🚀 Redis信息</h4>
            <div v-if="redisInfo" class="info-content">
              <p><strong>主机:</strong> {{ redisInfo.host }}</p>
              <p><strong>端口:</strong> {{ redisInfo.port }}</p>
              <p><strong>数据库:</strong> {{ redisInfo.database }}</p>
              <p><strong>超时时间:</strong> {{ redisInfo.timeout }}</p>
              <p><strong>最大连接:</strong> {{ redisInfo.maxActive }}</p>
            </div>
            <button @click="loadRedisInfo" class="btn btn-secondary">刷新信息</button>
          </div>
        </div>
      </div>

      <!-- 用户管理 -->
      <div v-show="activeTab === 'users'" class="tab-content">
        <div class="users-section">
          <div class="section-header">
            <h4>👥 用户管理</h4>
            <div class="controls">
              <input 
                v-model="searchKeyword" 
                @input="searchUsers"
                placeholder="搜索用户..."
                class="search-input"
              >
              <button @click="showCreateUserModal = true" class="btn btn-primary">添加用户</button>
              <button @click="loadUsers" class="btn btn-secondary">刷新</button>
            </div>
          </div>

          <!-- 用户统计 -->
          <div v-if="userStats" class="stats-row">
            <div class="stat-card">
              <span class="stat-number">{{ userStats.totalUsers }}</span>
              <span class="stat-label">总用户数</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ userStats.activeUsers }}</span>
              <span class="stat-label">活跃用户</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ userStats.adminUsers }}</span>
              <span class="stat-label">管理员</span>
            </div>
          </div>

          <!-- 用户列表 -->
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="'role-badge role-' + user.role.toLowerCase()">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span :class="'status-badge status-' + (user.status === 1 ? 'active' : 'inactive')">
                      {{ user.status === 1 ? '正常' : '禁用' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td class="actions">
                    <button @click="editUser(user)" class="btn-small btn-edit">编辑</button>
                    <button @click="deleteUser(user.id)" class="btn-small btn-delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- API接口测试 -->
      <div v-show="activeTab === 'api'" class="tab-content">
        <div class="api-section">
          <h4>🔌 API接口测试</h4>
          
          <div class="api-groups">
            <!-- 用户API -->
            <div class="api-group">
              <h5>👥 用户管理API</h5>
              <div class="api-list">
                <div v-for="api in userApis" :key="api.path" class="api-item">
                  <div class="api-info">
                    <span :class="'method method-' + api.method.toLowerCase()">{{ api.method }}</span>
                    <code class="api-path">{{ api.path }}</code>
                    <span class="api-desc">{{ api.description }}</span>
                  </div>
                  <button @click="testApi(api)" class="btn btn-small">测试</button>
                </div>
              </div>
            </div>

            <!-- 系统API -->
            <div class="api-group">
              <h5>🖥️ 系统信息API</h5>
              <div class="api-list">
                <div v-for="api in systemApis" :key="api.path" class="api-item">
                  <div class="api-info">
                    <span :class="'method method-' + api.method.toLowerCase()">{{ api.method }}</span>
                    <code class="api-path">{{ api.path }}</code>
                    <span class="api-desc">{{ api.description }}</span>
                  </div>
                  <button @click="testApi(api)" class="btn btn-small">测试</button>
                </div>
              </div>
            </div>
          </div>

          <!-- API响应显示 -->
          <div v-if="apiResponse" class="api-response">
            <h5>📋 API响应结果</h5>
            <div class="response-header">
              <span>{{ apiResponse.method }} {{ apiResponse.url }}</span>
              <span :class="'status-code status-' + Math.floor(apiResponse.status / 100)">
                {{ apiResponse.status }}
              </span>
            </div>
            <pre class="response-body">{{ JSON.stringify(apiResponse.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- SpringBoot功能特性 -->
      <div v-show="activeTab === 'features'" class="tab-content">
        <div class="features-section">
          <h4>⚡ SpringBoot功能特性</h4>
          
          <div v-if="features" class="features-grid">
            <div v-for="(featureGroup, key) in features" :key="key" class="feature-group">
              <h5>{{ getFeatureGroupTitle(key) }}</h5>
              <ul class="feature-list">
                <li v-for="(desc, name) in featureGroup" :key="name" class="feature-item">
                  <strong>{{ name }}:</strong> {{ desc }}
                </li>
              </ul>
            </div>
          </div>
          
          <button @click="loadFeatures" class="btn btn-primary">刷新功能列表</button>
        </div>
      </div>
    </main>

    <!-- 创建用户弹窗 -->
    <div v-if="showCreateUserModal" class="modal-overlay" @click="showCreateUserModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>添加新用户</h3>
          <button @click="showCreateUserModal = false" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label>用户名:</label>
              <input v-model="newUser.username" required>
            </div>
            <div class="form-group">
              <label>邮箱:</label>
              <input v-model="newUser.email" type="email" required>
            </div>
            <div class="form-group">
              <label>密码:</label>
              <input v-model="newUser.password" type="password" required>
            </div>
            <div class="form-group">
              <label>角色:</label>
              <select v-model="newUser.role">
                <option value="USER">用户</option>
                <option value="ADMIN">管理员</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">创建</button>
              <button type="button" @click="showCreateUserModal = false" class="btn btn-secondary">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MySpringbootView',
  data() {
    return {
      activeTab: 'system',
      serverOnline: false,
      systemInfo: null,
      databaseInfo: null,
      redisInfo: null,
      users: [],
      userStats: null,
      features: null,
      apiResponse: null,
      searchKeyword: '',
      showCreateUserModal: false,
      newUser: {
        username: '',
        email: '',
        password: '',
        role: 'USER'
      },
      tabs: [
        { id: 'system', name: '系统信息', icon: '🖥️' },
        { id: 'users', name: '用户管理', icon: '👥' },
        { id: 'api', name: 'API测试', icon: '🔌' },
        { id: 'features', name: '功能特性', icon: '⚡' }
      ],
      userApis: [
        { method: 'GET', path: '/api/users', description: '获取所有用户' },
        { method: 'GET', path: '/api/users/stats', description: '获取用户统计' },
        { method: 'GET', path: '/api/users/active', description: '获取活跃用户' },
        { method: 'GET', path: '/api/users/page', description: '分页获取用户' }
      ],
      systemApis: [
        { method: 'GET', path: '/api/system/info', description: '获取应用信息' },
        { method: 'GET', path: '/api/system/health', description: '健康检查' },
        { method: 'GET', path: '/api/system/database', description: '数据库信息' },
        { method: 'GET', path: '/api/system/redis', description: 'Redis信息' }
      ]
    }
  },
  mounted() {
    this.checkServerStatus();
    this.loadSystemInfo();
    this.loadUsers();
  },
  methods: {
    async apiRequest(url, options = {}) {
      const baseUrl = 'http://localhost:8080';
      try {
        const response = await fetch(baseUrl + url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        return await response.json();
      } catch (error) {
        console.error('API请求失败:', error);
        this.$message?.error?.('API请求失败: ' + error.message) || alert('API请求失败: ' + error.message);
        return null;
      }
    },

    async checkServerStatus() {
      try {
        const response = await this.apiRequest('/api/system/health');
        this.serverOnline = response && response.code === 200;
      } catch {
        this.serverOnline = false;
      }
    },

    async loadSystemInfo() {
      const response = await this.apiRequest('/api/system/info');
      if (response && response.code === 200) {
        this.systemInfo = response.data;
      }
    },

    async loadDatabaseInfo() {
      const response = await this.apiRequest('/api/system/database');
      if (response && response.code === 200) {
        this.databaseInfo = response.data;
      }
    },

    async loadRedisInfo() {
      const response = await this.apiRequest('/api/system/redis');
      if (response && response.code === 200) {
        this.redisInfo = response.data;
      }
    },

    async loadUsers() {
      const response = await this.apiRequest('/api/users');
      if (response && response.code === 200) {
        this.users = response.data;
      }
      
      const statsResponse = await this.apiRequest('/api/users/stats');
      if (statsResponse && statsResponse.code === 200) {
        this.userStats = statsResponse.data;
      }
    },

    async loadFeatures() {
      const response = await this.apiRequest('/api/system/features');
      if (response && response.code === 200) {
        this.features = response.data;
      }
    },

    async searchUsers() {
      if (!this.searchKeyword.trim()) {
        this.loadUsers();
        return;
      }
      
      const response = await this.apiRequest(`/api/users/search?keyword=${encodeURIComponent(this.searchKeyword)}`);
      if (response && response.code === 200) {
        this.users = response.data.content || [];
      }
    },

    async createUser() {
      const response = await this.apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(this.newUser)
      });
      
      if (response && response.code === 200) {
        this.showCreateUserModal = false;
        this.newUser = { username: '', email: '', password: '', role: 'USER' };
        this.loadUsers();
        this.$message?.success?.('用户创建成功') || alert('用户创建成功');
      }
    },

    async deleteUser(id) {
      if (!confirm('确定要删除这个用户吗？')) return;
      
      const response = await this.apiRequest(`/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (response && response.code === 200) {
        this.loadUsers();
        this.$message?.success?.('用户删除成功') || alert('用户删除成功');
      }
    },

    async testApi(api) {
      try {
        const response = await fetch('http://localhost:8080' + api.path);
        const data = await response.json();
        
        this.apiResponse = {
          method: api.method,
          url: api.path,
          status: response.status,
          data: data
        };
      } catch (error) {
        this.apiResponse = {
          method: api.method,
          url: api.path,
          status: 0,
          data: { error: error.message }
        };
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('zh-CN');
    },

    getFeatureGroupTitle(key) {
      const titles = {
        coreFeatures: '🔧 核心功能',
        webFeatures: '🌐 Web功能', 
        dataFeatures: '💾 数据访问',
        cacheFeatures: '🚀 缓存功能',
        securityFeatures: '🔐 安全功能',
        monitoringFeatures: '📊 监控功能'
      };
      return titles[key] || key;
    },

    editUser(user) {
      // 实现编辑用户功能
      console.log('编辑用户:', user);
    }
  }
}
</script>

<style scoped>
.springboot-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.server-status {
  margin-bottom: 30px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
  font-size: 1.2em;
  font-weight: bold;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-indicator.online .status-dot {
  background: #4CAF50;
}

.status-indicator.offline .status-dot {
  background: #f44336;
}

.feature-nav {
  display: flex;
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.nav-btn {
  flex: 1;
  padding: 15px;
  border: none;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1em;
}

.nav-btn:hover {
  background: #f5f5f5;
}

.nav-btn.active {
  background: #667eea;
  color: white;
}

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info-card h4 {
  margin-top: 0;
  color: #333;
}

.info-content p {
  margin: 8px 0;
  font-size: 0.9em;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.stat-number {
  display: block;
  font-size: 2em;
  font-weight: bold;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.9;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.role-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
}

.role-admin {
  background: #ff9800;
  color: white;
}

.role-user {
  background: #2196f3;
  color: white;
}

.status-active {
  background: #4caf50;
  color: white;
}

.status-inactive {
  background: #f44336;
  color: white;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn,
.btn-small {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-edit {
  background: #ffc107;
  color: black;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn:hover,
.btn-small:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.api-groups {
  margin-bottom: 30px;
}

.api-group {
  margin-bottom: 30px;
}

.api-group h5 {
  margin-bottom: 15px;
  color: #333;
}

.api-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.method {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8em;
  min-width: 50px;
  text-align: center;
}

.method-get {
  background: #61affe;
  color: white;
}

.api-path {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.api-desc {
  color: #666;
  font-size: 0.9em;
}

.api-response {
  margin-top: 30px;
  border-top: 2px solid #e0e0e0;
  padding-top: 20px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-code {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-2 {
  background: #4caf50;
  color: white;
}

.status-4,
.status-5 {
  background: #f44336;
  color: white;
}

.response-body {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  white-space: pre-wrap;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-group {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.feature-group h5 {
  margin-top: 0;
  color: #333;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-item {
  margin: 10px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 0.9em;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .springboot-container {
    padding: 10px;
  }
  
  .feature-nav {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
  
  .stats-row {
    flex-direction: column;
  }
  
  .api-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .api-info {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
}
</style> 