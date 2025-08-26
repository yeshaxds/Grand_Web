<template>
  <div class="redis-container">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1>🔴 Redis 数据库演示</h1>
      <p>展示Redis作为高性能数据库和缓存的强大功能</p>
    </header>

    <!-- 服务状态检查 -->
    <section class="server-status">
      <div class="status-card">
        <h3>📡 Redis服务器状态</h3>
        <div class="status-indicator" :class="{ 'online': redisOnline, 'offline': !redisOnline }">
          <span class="status-dot"></span>
          {{ redisOnline ? '在线' : '离线' }}
        </div>
        <button @click="checkRedisStatus" class="btn btn-primary">检查状态</button>
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
      <!-- 系统概览 -->
      <div v-show="activeTab === 'overview'" class="tab-content">
        <div class="overview-grid">
          <div class="overview-card" v-if="systemOverview">
            <h4>🖥️ 服务器信息</h4>
            <div class="info-content">
              <p><strong>Redis版本:</strong> {{ systemOverview.server?.version || 'N/A' }}</p>
              <p><strong>运行模式:</strong> {{ systemOverview.server?.mode || 'N/A' }}</p>
              <p><strong>运行时间:</strong> {{ systemOverview.server?.uptime || 'N/A' }}</p>
              <p><strong>端口:</strong> {{ systemOverview.server?.port || 'N/A' }}</p>
            </div>
          </div>

          <div class="overview-card" v-if="systemOverview">
            <h4>💾 数据库状态</h4>
            <div class="info-content">
              <p><strong>总键数:</strong> {{ systemOverview.database?.totalKeys || 0 }}</p>
              <p><strong>命中率:</strong> {{ systemOverview.database?.hitRate || 'N/A' }}</p>
              <p><strong>键空间命中:</strong> {{ systemOverview.database?.keyspaceHits || 0 }}</p>
              <p><strong>键空间未命中:</strong> {{ systemOverview.database?.keyspaceMisses || 0 }}</p>
            </div>
          </div>

          <div class="overview-card" v-if="systemOverview">
            <h4>📊 内存使用</h4>
            <div class="info-content">
              <p><strong>已使用:</strong> {{ systemOverview.memory?.used || 'N/A' }}</p>
              <p><strong>峰值:</strong> {{ systemOverview.memory?.peak || 'N/A' }}</p>
              <p><strong>系统总计:</strong> {{ systemOverview.memory?.system || 'N/A' }}</p>
            </div>
          </div>

          <div class="overview-card" v-if="systemOverview">
            <h4>👥 客户端连接</h4>
            <div class="info-content">
              <p><strong>已连接:</strong> {{ systemOverview.clients?.connected || 0 }}</p>
              <p><strong>阻塞中:</strong> {{ systemOverview.clients?.blocked || 0 }}</p>
              <p><strong>最大连接:</strong> {{ systemOverview.clients?.maxClients || 0 }}</p>
            </div>
          </div>
        </div>
        
        <button @click="loadSystemOverview" class="btn btn-primary">刷新概览</button>
      </div>

      <!-- 数据类型演示 -->
      <div v-show="activeTab === 'datatypes'" class="tab-content">
        <div class="datatypes-section">
          <h4>🗃️ Redis数据类型演示</h4>
          
          <div class="datatype-grid">
            <div v-for="datatype in datatypes" :key="datatype.type" class="datatype-card">
              <div class="datatype-header">
                <h5>{{ datatype.icon }} {{ datatype.name }}</h5>
                <span class="datatype-badge">{{ datatype.type }}</span>
              </div>
              
              <p class="datatype-desc">{{ datatype.description }}</p>
              
              <div class="datatype-demo" v-if="datatype.demoData">
                <h6>演示数据:</h6>
                <div class="demo-content">
                  <div v-if="datatype.type === 'strings'" class="demo-strings">
                    <div v-for="item in datatype.demoData.slice(0, 3)" :key="item.key" class="demo-item">
                      <code>{{ item.key }}</code> → {{ item.value.length > 30 ? item.value.substring(0, 30) + '...' : item.value }}
                    </div>
                  </div>
                  
                  <div v-else-if="datatype.type === 'hashes'" class="demo-hashes">
                    <div v-for="(hash, key) in datatype.demoData" :key="key" class="demo-item">
                      <code>{{ key }}</code>
                      <div class="hash-fields">
                        <span v-for="(value, field) in hash.fields" :key="field" class="field-tag">
                          {{ field }}: {{ value }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else-if="datatype.type === 'lists'" class="demo-lists">
                    <div v-for="(list, key) in datatype.demoData" :key="key" class="demo-item">
                      <code>{{ key }}</code>
                      <div class="list-elements">
                        <span v-for="(element, index) in list.elements.slice(0, 5)" :key="index" class="element-tag">
                          {{ element }}
                        </span>
                        <span v-if="list.elements.length > 5" class="more-indicator">+{{ list.elements.length - 5 }} more</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="demo-generic">
                    <pre>{{ JSON.stringify(datatype.demoData, null, 2).substring(0, 200) }}...</pre>
                  </div>
                </div>
              </div>
              
              <div class="datatype-actions">
                <button @click="loadDemoData(datatype.type)" class="btn btn-small">加载演示</button>
                <button @click="testDatatype(datatype.type)" class="btn btn-small btn-secondary">测试操作</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级功能 -->
      <div v-show="activeTab === 'advanced'" class="tab-content">
        <div class="advanced-section">
          <h4>⚡ Redis高级功能</h4>
          
          <div class="feature-tabs">
            <button 
              v-for="feature in advancedFeatures" 
              :key="feature.id"
              @click="activeAdvancedFeature = feature.id"
              :class="{ 'active': activeAdvancedFeature === feature.id }"
              class="feature-tab"
            >
              {{ feature.icon }} {{ feature.name }}
            </button>
          </div>

          <div class="feature-content">
            <!-- 事务演示 -->
            <div v-show="activeAdvancedFeature === 'transactions'" class="feature-panel">
              <h5>💳 事务演示</h5>
              <div v-if="transactionDemo" class="transaction-demo">
                <div class="demo-scenarios">
                  <div v-for="scenario in transactionDemo.scenarios" :key="scenario.name" class="scenario-card">
                    <h6>{{ scenario.name }}</h6>
                    <p>{{ scenario.description }}</p>
                    <div class="scenario-example">
                      <strong>示例:</strong>
                      <pre>{{ JSON.stringify(scenario.example, null, 2) }}</pre>
                    </div>
                    <button @click="runTransactionDemo(scenario)" class="btn btn-small">运行演示</button>
                  </div>
                </div>
              </div>
              <button @click="loadTransactionDemo" class="btn btn-primary">加载事务演示</button>
            </div>

            <!-- Lua脚本演示 -->
            <div v-show="activeAdvancedFeature === 'scripts'" class="feature-panel">
              <h5>📜 Lua脚本演示</h5>
              <div v-if="scriptDemo" class="script-demo">
                <div class="script-examples">
                  <div v-for="example in scriptDemo.data.scriptExamples" :key="example.name" class="script-card">
                    <h6>{{ example.name }}</h6>
                    <p>{{ example.description }}</p>
                    <div class="script-example">
                      <strong>示例参数:</strong>
                      <pre>{{ JSON.stringify(example.example, null, 2) }}</pre>
                    </div>
                    <button @click="runScriptDemo(example)" class="btn btn-small">执行脚本</button>
                  </div>
                </div>
              </div>
              <button @click="loadScriptDemo" class="btn btn-primary">加载脚本演示</button>
            </div>

            <!-- 发布订阅演示 -->
            <div v-show="activeAdvancedFeature === 'pubsub'" class="feature-panel">
              <h5>📢 发布订阅演示</h5>
              <div class="pubsub-demo">
                <div class="pubsub-controls">
                  <div class="control-group">
                    <label>频道名称:</label>
                    <input v-model="pubsubChannel" placeholder="demo:notifications">
                  </div>
                  <div class="control-group">
                    <label>消息内容:</label>
                    <textarea v-model="pubsubMessage" placeholder='{"type":"info","message":"测试消息"}'></textarea>
                  </div>
                  <div class="control-actions">
                    <button @click="publishMessage" class="btn btn-primary">发布消息</button>
                    <button @click="loadPubSubDemo" class="btn btn-secondary">加载演示</button>
                  </div>
                </div>
                
                <div v-if="pubsubResults.length > 0" class="pubsub-results">
                  <h6>发布结果:</h6>
                  <div v-for="result in pubsubResults" :key="result.timestamp" class="pubsub-result">
                    <span class="timestamp">{{ formatTime(result.timestamp) }}</span>
                    <span class="channel">{{ result.channel }}</span>
                    <span class="subscribers">{{ result.subscribers }} 订阅者</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实际应用 -->
      <div v-show="activeTab === 'applications'" class="tab-content">
        <div class="applications-section">
          <h4>💼 实际应用场景</h4>
          
          <div class="application-grid">
            <div v-for="app in applications" :key="app.name" class="application-card">
              <div class="app-header">
                <h5>{{ app.icon }} {{ app.name }}</h5>
                <span class="app-category">{{ app.category }}</span>
              </div>
              
              <p class="app-description">{{ app.description }}</p>
              
              <div class="app-features">
                <h6>核心功能:</h6>
                <ul>
                  <li v-for="feature in app.features" :key="feature">{{ feature }}</li>
                </ul>
              </div>
              
              <div class="app-demo" v-if="app.demoData">
                <h6>演示数据:</h6>
                <div class="demo-stats">
                  <div v-for="(value, key) in app.demoData" :key="key" class="stat-item">
                    <span class="stat-label">{{ key }}:</span>
                    <span class="stat-value">{{ value }}</span>
                  </div>
                </div>
              </div>
              
              <button @click="loadApplicationDemo(app.endpoint)" class="btn btn-primary">体验演示</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能监控 -->
      <div v-show="activeTab === 'monitoring'" class="tab-content">
        <div class="monitoring-section">
          <h4>📈 性能监控</h4>
          
          <div class="metrics-grid">
            <div class="metric-card" v-if="performanceMetrics">
              <h5>🚀 操作性能</h5>
              <div class="metric-content">
                <div class="metric-item">
                  <span class="metric-label">总命令数:</span>
                  <span class="metric-value">{{ performanceMetrics.totalCommands || 'N/A' }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">每秒命令数:</span>
                  <span class="metric-value">{{ performanceMetrics.commandsPerSecond || 'N/A' }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">总连接数:</span>
                  <span class="metric-value">{{ performanceMetrics.totalConnections || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="metric-card">
              <h5>⏱️ 响应时间测试</h5>
              <div class="performance-test">
                <div class="test-controls">
                  <select v-model="testType">
                    <option value="simple">简单操作</option>
                    <option value="pipeline">管道操作</option>
                    <option value="batch">批量操作</option>
                  </select>
                  <input v-model.number="testCount" type="number" min="10" max="1000" placeholder="测试次数">
                  <button @click="runPerformanceTest" class="btn btn-primary">运行测试</button>
                </div>
                
                <div v-if="testResults" class="test-results">
                  <div class="result-item">
                    <span>执行时间:</span>
                    <span>{{ testResults.executionTime }}</span>
                  </div>
                  <div class="result-item">
                    <span>平均延迟:</span>
                    <span>{{ testResults.avgTimePerOperation }}</span>
                  </div>
                  <div class="result-item">
                    <span>操作/秒:</span>
                    <span>{{ testResults.operationsPerSecond }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="metric-card">
              <h5>🔍 键空间分析</h5>
              <div class="keyspace-analysis">
                <button @click="analyzeKeyspace" class="btn btn-primary">分析键空间</button>
                <div v-if="keyspaceAnalysis" class="analysis-results">
                  <div class="analysis-item">
                    <span>总键数:</span>
                    <span>{{ keyspaceAnalysis.totalKeys }}</span>
                  </div>
                  <div class="analysis-breakdown">
                    <h6>按类型分布:</h6>
                    <div v-for="(count, type) in keyspaceAnalysis.keyTypes" :key="type" class="type-item">
                      <span>{{ type }}:</span>
                      <span>{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="loadPerformanceMetrics" class="btn btn-primary">刷新监控数据</button>
        </div>
      </div>
    </main>

    <!-- 结果显示模态框 -->
    <div v-if="showResultModal" class="modal-overlay" @click="showResultModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ resultModal.title }}</h3>
          <button @click="showResultModal = false" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <pre class="result-content">{{ JSON.stringify(resultModal.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyRedisView',
  data() {
    return {
      activeTab: 'overview',
      activeAdvancedFeature: 'transactions',
      redisOnline: false,
      systemOverview: null,
      performanceMetrics: null,
      keyspaceAnalysis: null,
      transactionDemo: null,
      scriptDemo: null,
      
      // 测试相关
      testType: 'simple',
      testCount: 50,
      testResults: null,
      
      // 发布订阅
      pubsubChannel: 'demo:notifications',
      pubsubMessage: '{"type":"info","message":"测试消息"}',
      pubsubResults: [],
      
      // 模态框
      showResultModal: false,
      resultModal: { title: '', data: null },
      
      tabs: [
        { id: 'overview', name: '系统概览', icon: '📊' },
        { id: 'datatypes', name: '数据类型', icon: '🗃️' },
        { id: 'advanced', name: '高级功能', icon: '⚡' },
        { id: 'applications', name: '实际应用', icon: '💼' },
        { id: 'monitoring', name: '性能监控', icon: '📈' }
      ],
      
      advancedFeatures: [
        { id: 'transactions', name: '事务', icon: '💳' },
        { id: 'scripts', name: 'Lua脚本', icon: '📜' },
        { id: 'pubsub', name: '发布订阅', icon: '📢' }
      ],
      
      datatypes: [
        {
          type: 'strings',
          name: 'String (字符串)',
          icon: '📝',
          description: 'Redis最基本的数据类型，可以存储字符串、数字或二进制数据',
          demoData: null
        },
        {
          type: 'hashes',
          name: 'Hash (哈希表)',
          icon: '🗂️',
          description: '键值对集合，适合存储对象',
          demoData: null
        },
        {
          type: 'lists',
          name: 'List (列表)',
          icon: '📋',
          description: '有序的字符串列表，支持队列和栈操作',
          demoData: null
        },
        {
          type: 'sets',
          name: 'Set (集合)',
          icon: '🎯',
          description: '无序的唯一字符串集合',
          demoData: null
        },
        {
          type: 'sorted-sets',
          name: 'Sorted Set (有序集合)',
          icon: '🏆',
          description: '带分数的有序集合，适合排行榜',
          demoData: null
        },
        {
          type: 'streams',
          name: 'Stream (流)',
          icon: '🌊',
          description: '消息流，支持消费者组',
          demoData: null
        }
      ],
      
      applications: [
        {
          name: '缓存系统',
          icon: '🚀',
          category: '性能优化',
          description: '高速数据缓存，减少数据库查询，提升应用性能',
          features: ['用户信息缓存', '热点数据缓存', '查询结果缓存', '缓存穿透防护'],
          endpoint: '/api/cache/demo',
          demoData: null
        },
        {
          name: '会话管理',
          icon: '🔐',
          category: '用户管理',
          description: '分布式会话存储，支持多服务器共享用户状态',
          features: ['用户登录状态', '会话自动过期', '多设备管理', '强制下线'],
          endpoint: '/api/sessions/demo',
          demoData: null
        },
        {
          name: '实时分析',
          icon: '📊',
          category: '数据分析',
          description: '用户行为分析和实时统计，支持漏斗分析和留存分析',
          features: ['事件跟踪', '实时统计', '漏斗分析', 'A/B测试'],
          endpoint: '/api/analytics/demo',
          demoData: null
        },
        {
          name: '消息队列',
          icon: '📨',
          category: '异步处理',
          description: '基于List和Stream的消息队列系统',
          features: ['任务队列', '消息广播', '消费者组', '消息确认'],
          endpoint: '/api/streams/demo',
          demoData: null
        }
      ]
    }
  },
  
  mounted() {
    this.checkRedisStatus();
    this.loadSystemOverview();
  },
  
  methods: {
    async apiRequest(url, options = {}) {
      const baseUrl = 'http://localhost:8081';
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

    async checkRedisStatus() {
      try {
        const response = await this.apiRequest('/health');
        this.redisOnline = response && response.redis === 'connected';
      } catch {
        this.redisOnline = false;
      }
    },

    async loadSystemOverview() {
      const response = await this.apiRequest('/api/system/overview');
      if (response && response.success) {
        this.systemOverview = response.overview;
      }
    },

    async loadPerformanceMetrics() {
      const response = await this.apiRequest('/api/system/overview');
      if (response && response.success) {
        this.performanceMetrics = response.overview.performance;
      }
    },

    async loadDemoData(datatype) {
      const response = await this.apiRequest(`/api/${datatype}/demo`);
      if (response && response.success) {
        const datatypeObj = this.datatypes.find(dt => dt.type === datatype);
        if (datatypeObj) {
          datatypeObj.demoData = response.data;
        }
      }
    },

    async testDatatype(datatype) {
      const response = await this.apiRequest(`/api/${datatype}/demo`);
      if (response) {
        this.showResult(`${datatype} 数据类型演示`, response);
      }
    },

    async loadTransactionDemo() {
      const response = await this.apiRequest('/api/transactions/demo');
      if (response && response.success) {
        this.transactionDemo = response;
      }
    },

    async runTransactionDemo(scenario) {
      const response = await this.apiRequest(scenario.endpoint, {
        method: 'POST',
        body: JSON.stringify(scenario.example)
      });
      if (response) {
        this.showResult(`事务演示: ${scenario.name}`, response);
      }
    },

    async loadScriptDemo() {
      const response = await this.apiRequest('/api/scripts/demo');
      if (response && response.success) {
        this.scriptDemo = response;
      }
    },

    async runScriptDemo(example) {
      const response = await this.apiRequest(example.endpoint, {
        method: 'POST',
        body: JSON.stringify(example.example)
      });
      if (response) {
        this.showResult(`Lua脚本: ${example.name}`, response);
      }
    },

    async loadPubSubDemo() {
      const response = await this.apiRequest('/api/pubsub/demo');
      if (response) {
        this.showResult('发布订阅演示', response);
      }
    },

    async publishMessage() {
      if (!this.pubsubChannel || !this.pubsubMessage) {
        alert('请填写频道名称和消息内容');
        return;
      }

      try {
        const message = JSON.parse(this.pubsubMessage);
        const response = await this.apiRequest('/api/pubsub/publish', {
          method: 'POST',
          body: JSON.stringify({
            channel: this.pubsubChannel,
            message
          })
        });

        if (response && response.success) {
          this.pubsubResults.unshift({
            timestamp: Date.now(),
            channel: this.pubsubChannel,
            subscribers: response.subscribers
          });
          
          if (this.pubsubResults.length > 10) {
            this.pubsubResults = this.pubsubResults.slice(0, 10);
          }
        }
      } catch (error) {
        alert('消息格式错误，请输入有效的JSON');
      }
    },

    async loadApplicationDemo(endpoint) {
      const response = await this.apiRequest(endpoint);
      if (response) {
        const app = this.applications.find(a => a.endpoint === endpoint);
        if (app) {
          app.demoData = this.extractDemoStats(response);
        }
        this.showResult('应用演示', response);
      }
    },

    extractDemoStats(response) {
      if (response.data && response.data.overview) {
        return response.data.overview;
      }
      if (response.stats) {
        return response.stats;
      }
      if (response.data && response.data.statistics) {
        return response.data.statistics;
      }
      return { 演示数据: '已加载' };
    },

    async runPerformanceTest() {
      let endpoint = '/api/pipelines/demo-performance';
      let body = { commandCount: this.testCount };

      if (this.testType === 'batch') {
        endpoint = '/api/pipelines/demo-batch-operations';
        body = { count: this.testCount, operation: 'mixed' };
      } else if (this.testType === 'pipeline') {
        endpoint = '/api/scripts/performance-test';
        body = { testType: 'counter', iterations: this.testCount };
      }

      const response = await this.apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (response && response.success) {
        this.testResults = {
          executionTime: response.executionTime || response.executionTime,
          avgTimePerOperation: response.avgTimePerCommand || response.avgTimePerOperation,
          operationsPerSecond: response.operationsPerSecond || Math.round(this.testCount / (parseInt(response.executionTime) / 1000))
        };
      }
    },

    async analyzeKeyspace() {
      const response = await this.apiRequest('/api/system/keys');
      if (response && response.success) {
        const keyTypes = {};
        response.keys.forEach(key => {
          const type = key.type;
          keyTypes[type] = (keyTypes[type] || 0) + 1;
        });
        
        this.keyspaceAnalysis = {
          totalKeys: response.keys.length,
          keyTypes
        };
      }
    },

    showResult(title, data) {
      this.resultModal = { title, data };
      this.showResultModal = true;
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  }
}
</script>

<style scoped>
.redis-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
  background: #10b981;
}

.status-indicator.offline .status-dot {
  background: #ef4444;
}

.feature-nav {
  display: flex;
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  flex-wrap: wrap;
}

.nav-btn {
  flex: 1;
  min-width: 150px;
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
  background: #dc2626;
  color: white;
}

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.overview-card h4 {
  margin-top: 0;
  color: #333;
  font-size: 1.1em;
}

.info-content p {
  margin: 8px 0;
  font-size: 0.9em;
}

.datatype-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.datatype-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.datatype-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.datatype-badge {
  background: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.datatype-desc {
  color: #666;
  margin-bottom: 15px;
}

.demo-content {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  max-height: 150px;
  overflow-y: auto;
}

.demo-item {
  margin-bottom: 8px;
  padding: 5px;
  background: #f1f5f9;
  border-radius: 4px;
}

.demo-item code {
  background: #e2e8f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.8em;
}

.hash-fields, .list-elements {
  margin-top: 5px;
}

.field-tag, .element-tag {
  display: inline-block;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  margin: 2px;
  border-radius: 4px;
  font-size: 0.8em;
}

.more-indicator {
  color: #666;
  font-style: italic;
  font-size: 0.8em;
}

.datatype-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.feature-tabs {
  display: flex;
  margin-bottom: 20px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.feature-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-tab.active {
  background: #dc2626;
  color: white;
}

.feature-panel {
  min-height: 300px;
}

.demo-scenarios, .script-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.scenario-card, .script-card {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.scenario-example, .script-example {
  margin: 10px 0;
}

.scenario-example pre, .script-example pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8em;
}

.pubsub-controls {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.control-group input, .control-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.control-group textarea {
  min-height: 80px;
  resize: vertical;
}

.control-actions {
  display: flex;
  gap: 10px;
}

.pubsub-results {
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.pubsub-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.timestamp {
  font-size: 0.8em;
  color: #666;
}

.channel {
  font-family: monospace;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.subscribers {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.application-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.application-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.app-category {
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.app-description {
  color: #666;
  margin-bottom: 15px;
}

.app-features ul {
  list-style: none;
  padding: 0;
}

.app-features li {
  padding: 4px 0;
  color: #374151;
}

.app-features li:before {
  content: "✓ ";
  color: #10b981;
  font-weight: bold;
}

.demo-stats {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.metric-content, .performance-test, .keyspace-analysis {
  margin-top: 15px;
}

.metric-item, .result-item, .analysis-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.test-controls select, .test-controls input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.analysis-breakdown {
  margin-top: 15px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #374151;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin: 5px;
}

.btn-primary {
  background: #dc2626;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
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

.result-content {
  background: #1f2937;
  color: #f9fafb;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9em;
  max-height: 400px;
}

@media (max-width: 768px) {
  .redis-container {
    padding: 10px;
  }
  
  .feature-nav {
    flex-direction: column;
  }
  
  .nav-btn {
    min-width: auto;
  }
  
  .overview-grid, .datatype-grid, .application-grid, .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-scenarios, .script-examples {
    grid-template-columns: 1fr;
  }
  
  .test-controls {
    flex-direction: column;
  }
  
  .control-actions {
    flex-direction: column;
  }
}
</style> 