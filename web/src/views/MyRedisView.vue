<template>
  <div class="redis-view">
    <!-- 头部状态栏 -->
    <div class="header-status">
      <div class="status-card">
        <div class="status-indicator" :class="{ online: redisOnline, offline: !redisOnline }">
          {{ redisOnline ? '🟢' : '🔴' }}
        </div>
        <div class="status-text">
          <h3>Redis 服务器</h3>
          <p>{{ redisOnline ? '在线' : '离线' }}</p>
        </div>
        <button @click="checkRedisStatus" class="refresh-btn">刷新状态</button>
      </div>
    </div>

    <!-- 标签导航 -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
          class="tab-button"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 系统概览 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="section-header">
          <h2>🔍 Redis 系统概览</h2>
          <button @click="loadSystemOverview" class="load-btn" :disabled="!redisOnline">
            {{ isLoading ? '加载中...' : '刷新数据' }}
          </button>
        </div>

        <div v-if="systemOverview" class="overview-grid">
          <div class="info-card">
            <h3>📊 基本信息</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Redis 版本:</span>
                <span class="value">{{ systemOverview.version }}</span>
              </div>
              <div class="info-item">
                <span class="label">运行模式:</span>
                <span class="value">{{ systemOverview.mode }}</span>
              </div>
              <div class="info-item">
                <span class="label">运行时间:</span>
                <span class="value">{{ systemOverview.uptime }}</span>
              </div>
              <div class="info-item">
                <span class="label">配置文件:</span>
                <span class="value">{{ systemOverview.configFile || '默认配置' }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>💾 内存使用</h3>
            <div class="memory-stats">
              <div class="memory-item">
                <span class="label">已使用内存:</span>
                <span class="value">{{ systemOverview.usedMemory }}</span>
              </div>
              <div class="memory-item">
                <span class="label">内存峰值:</span>
                <span class="value">{{ systemOverview.peakMemory }}</span>
              </div>
              <div class="memory-item">
                <span class="label">内存碎片率:</span>
                <span class="value">{{ systemOverview.fragmentation }}%</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>📈 性能指标</h3>
            <div class="performance-stats">
              <div class="perf-item">
                <span class="label">总连接数:</span>
                <span class="value">{{ systemOverview.connections }}</span>
              </div>
              <div class="perf-item">
                <span class="label">总命令数:</span>
                <span class="value">{{ systemOverview.totalCommands }}</span>
              </div>
              <div class="perf-item">
                <span class="label">命令/秒:</span>
                <span class="value">{{ systemOverview.commandsPerSec }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>🗃️ 数据库信息</h3>
            <div class="db-stats">
              <div v-for="(db, index) in systemOverview.databases" :key="index" class="db-item">
                <span class="label">DB{{ index }}:</span>
                <span class="value">{{ db.keys }} keys, {{ db.expires }} expires</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据类型演示 -->
      <div v-if="activeTab === 'datatypes'" class="tab-content">
        <div class="section-header">
          <h2>🗃️ Redis 数据类型演示</h2>
        </div>

        <div class="datatypes-grid">
          <!-- String 类型 -->
          <div class="datatype-card">
            <h3>📝 String 类型</h3>
            <div class="demo-section">
              <div class="input-group">
                <input v-model="stringKey" placeholder="键名" class="input-field">
                <input v-model="stringValue" placeholder="值" class="input-field">
              </div>
              <div class="button-group">
                <button @click="setString" class="action-btn">SET</button>
                <button @click="getString" class="action-btn">GET</button>
                <button @click="deleteString" class="action-btn danger">DEL</button>
              </div>
              <div v-if="stringResult" class="result-display">
                结果: {{ stringResult }}
              </div>
            </div>
          </div>

          <!-- List 类型 -->
          <div class="datatype-card">
            <h3>📋 List 类型</h3>
            <div class="demo-section">
              <div class="input-group">
                <input v-model="listKey" placeholder="列表名" class="input-field">
                <input v-model="listValue" placeholder="值" class="input-field">
              </div>
              <div class="button-group">
                <button @click="pushList" class="action-btn">LPUSH</button>
                <button @click="popList" class="action-btn">LPOP</button>
                <button @click="getList" class="action-btn">LRANGE</button>
              </div>
              <div v-if="listResult" class="result-display">
                <div v-if="Array.isArray(listResult)">
                  <div v-for="(item, index) in listResult" :key="index">
                    {{ index }}: {{ item }}
                  </div>
                </div>
                <div v-else>{{ listResult }}</div>
              </div>
            </div>
          </div>

          <!-- Set 类型 -->
          <div class="datatype-card">
            <h3>🎯 Set 类型</h3>
            <div class="demo-section">
              <div class="input-group">
                <input v-model="setKey" placeholder="集合名" class="input-field">
                <input v-model="setValue" placeholder="成员" class="input-field">
              </div>
              <div class="button-group">
                <button @click="addSet" class="action-btn">SADD</button>
                <button @click="getSet" class="action-btn">SMEMBERS</button>
                <button @click="removeSet" class="action-btn danger">SREM</button>
              </div>
              <div v-if="setResult" class="result-display">
                <div v-if="Array.isArray(setResult)">
                  成员: {{ setResult.join(', ') }}
                </div>
                <div v-else>{{ setResult }}</div>
              </div>
            </div>
          </div>

          <!-- Hash 类型 -->
          <div class="datatype-card">
            <h3>🗂️ Hash 类型</h3>
            <div class="demo-section">
              <div class="input-group">
                <input v-model="hashKey" placeholder="哈希名" class="input-field">
                <input v-model="hashField" placeholder="字段" class="input-field">
                <input v-model="hashValue" placeholder="值" class="input-field">
              </div>
              <div class="button-group">
                <button @click="setHash" class="action-btn">HSET</button>
                <button @click="getHash" class="action-btn">HGET</button>
                <button @click="getAllHash" class="action-btn">HGETALL</button>
              </div>
              <div v-if="hashResult" class="result-display">
                <div v-if="typeof hashResult === 'object' && hashResult !== null">
                  <div v-for="(value, field) in hashResult" :key="field">
                    {{ field }}: {{ value }}
                  </div>
                </div>
                <div v-else>{{ hashResult }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级功能 -->
      <div v-if="activeTab === 'advanced'" class="tab-content">
        <div class="section-header">
          <h2>⚡ Redis 高级功能</h2>
        </div>

        <div class="advanced-grid">
          <!-- 发布订阅 -->
          <div class="feature-card">
            <h3>📡 发布订阅 (Pub/Sub)</h3>
            <div class="pubsub-section">
              <div class="input-group">
                <input v-model="pubsubChannel" placeholder="频道名" class="input-field">
                <textarea v-model="pubsubMessage" placeholder="消息内容" class="textarea-field"></textarea>
              </div>
              <div class="button-group">
                <button @click="publishMessage" class="action-btn">发布消息</button>
                <button @click="subscribeChannel" class="action-btn">订阅频道</button>
                <button @click="unsubscribeChannel" class="action-btn danger">取消订阅</button>
              </div>
              <div v-if="pubsubResults.length > 0" class="pubsub-messages">
                <h4>收到的消息:</h4>
                <div v-for="(msg, index) in pubsubResults" :key="index" class="message-item">
                  <span class="timestamp">{{ msg.timestamp }}</span>
                  <span class="channel">{{ msg.channel }}</span>
                  <span class="content">{{ msg.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 事务演示 -->
          <div class="feature-card">
            <h3>💳 事务 (Transactions)</h3>
            <div class="transaction-section">
              <div class="transaction-commands">
                <h4>事务命令队列:</h4>
                <div class="command-list">
                  <div v-for="(cmd, index) in transactionCommands" :key="index" class="command-item">
                    {{ cmd }}
                    <button @click="removeCommand(index)" class="remove-btn">×</button>
                  </div>
                </div>
              </div>
              <div class="input-group">
                <input v-model="newCommand" placeholder="添加命令 (如: SET key value)" class="input-field">
                <button @click="addCommand" class="action-btn">添加命令</button>
              </div>
              <div class="button-group">
                <button @click="executeTransaction" class="action-btn success">执行事务</button>
                <button @click="clearCommands" class="action-btn danger">清空队列</button>
              </div>
              <div v-if="transactionResult" class="result-display">
                <h4>事务结果:</h4>
                <pre>{{ JSON.stringify(transactionResult, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- 过期时间 -->
          <div class="feature-card">
            <h3>⏰ 过期时间 (TTL)</h3>
            <div class="ttl-section">
              <div class="input-group">
                <input v-model="ttlKey" placeholder="键名" class="input-field">
                <input v-model="ttlValue" placeholder="值" class="input-field">
                <input v-model="ttlSeconds" type="number" placeholder="过期秒数" class="input-field">
              </div>
              <div class="button-group">
                <button @click="setWithTTL" class="action-btn">设置带过期时间</button>
                <button @click="getTTL" class="action-btn">查看剩余时间</button>
                <button @click="removeTTL" class="action-btn">移除过期时间</button>
              </div>
              <div v-if="ttlResult" class="result-display">
                {{ ttlResult }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能测试 -->
      <div v-if="activeTab === 'performance'" class="tab-content">
        <div class="section-header">
          <h2>📈 性能测试</h2>
        </div>

        <div class="performance-section">
          <div class="test-config">
            <h3>测试配置</h3>
            <div class="config-group">
              <label>测试类型:</label>
              <select v-model="testType" class="select-field">
                <option value="simple">简单读写</option>
                <option value="batch">批量操作</option>
                <option value="concurrent">并发测试</option>
                <option value="pipeline">管道测试</option>
              </select>
            </div>
            <div class="config-group">
              <label>测试次数:</label>
              <input v-model.number="testCount" type="number" min="10" max="10000" class="input-field">
            </div>
            <button @click="runPerformanceTest" class="action-btn" :disabled="isLoading || !redisOnline">
              {{ isLoading ? '测试中...' : '开始测试' }}
            </button>
          </div>

          <div v-if="testResults" class="test-results">
            <h3>测试结果</h3>
            <div class="results-grid">
              <div class="result-card">
                <h4>⏱️ 性能指标</h4>
                <div class="metric-item">
                  <span class="label">总耗时:</span>
                  <span class="value">{{ testResults.totalTime }}ms</span>
                </div>
                <div class="metric-item">
                  <span class="label">平均延迟:</span>
                  <span class="value">{{ testResults.avgLatency }}ms</span>
                </div>
                <div class="metric-item">
                  <span class="label">操作/秒:</span>
                  <span class="value">{{ testResults.opsPerSecond }}</span>
                </div>
                <div class="metric-item">
                  <span class="label">成功率:</span>
                  <span class="value">{{ testResults.successRate }}%</span>
                </div>
              </div>
              
              <div class="result-card">
                <h4>📊 统计信息</h4>
                <div class="stat-item">
                  <span class="label">最小延迟:</span>
                  <span class="value">{{ testResults.minLatency }}ms</span>
                </div>
                <div class="stat-item">
                  <span class="label">最大延迟:</span>
                  <span class="value">{{ testResults.maxLatency }}ms</span>
                </div>
                <div class="stat-item">
                  <span class="label">成功操作:</span>
                  <span class="value">{{ testResults.successCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">失败操作:</span>
                  <span class="value">{{ testResults.errorCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实际应用场景 -->
      <div v-if="activeTab === 'applications'" class="tab-content">
        <div class="section-header">
          <h2>💼 实际应用场景</h2>
        </div>

        <div class="applications-grid">
          <!-- 缓存演示 -->
          <div class="app-card">
            <h3>🚀 缓存系统</h3>
            <div class="cache-demo">
              <div class="input-group">
                <input v-model="cacheKey" placeholder="缓存键" class="input-field">
                <input v-model="cacheExpiry" type="number" placeholder="过期时间(秒)" class="input-field">
              </div>
              <div class="button-group">
                <button @click="simulateCache" class="action-btn">模拟缓存查询</button>
                <button @click="clearCache" class="action-btn danger">清空缓存</button>
              </div>
              <div v-if="cacheResult" class="result-display">
                <div class="cache-result">
                  <div class="result-type" :class="cacheResult.fromCache ? 'from-cache' : 'from-db'">
                    {{ cacheResult.fromCache ? '🟢 缓存命中' : '🔴 数据库查询' }}
                  </div>
                  <div class="result-time">耗时: {{ cacheResult.responseTime }}ms</div>
                  <div class="result-data">数据: {{ JSON.stringify(cacheResult.data) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分布式锁 -->
          <div class="app-card">
            <h3>🔒 分布式锁</h3>
            <div class="lock-demo">
              <div class="input-group">
                <input v-model="lockKey" placeholder="锁名称" class="input-field">
                <input v-model="lockTimeout" type="number" placeholder="超时时间(秒)" class="input-field">
              </div>
              <div class="button-group">
                <button @click="acquireLock" class="action-btn">获取锁</button>
                <button @click="releaseLock" class="action-btn danger">释放锁</button>
                <button @click="checkLock" class="action-btn">检查锁状态</button>
              </div>
              <div v-if="lockResult" class="result-display">
                <div class="lock-status" :class="lockResult.acquired ? 'acquired' : 'failed'">
                  状态: {{ lockResult.acquired ? '🔓 已获取' : '🔒 获取失败' }}
                </div>
                <div v-if="lockResult.message" class="lock-message">
                  {{ lockResult.message }}
                </div>
              </div>
            </div>
          </div>

          <!-- 会话存储 -->
          <div class="app-card">
            <h3>👤 会话存储</h3>
            <div class="session-demo">
              <div class="input-group">
                <input v-model="sessionId" placeholder="会话ID" class="input-field">
                <textarea v-model="sessionData" placeholder="会话数据 (JSON)" class="textarea-field"></textarea>
              </div>
              <div class="button-group">
                <button @click="saveSession" class="action-btn">保存会话</button>
                <button @click="getSession" class="action-btn">获取会话</button>
                <button @click="deleteSession" class="action-btn danger">删除会话</button>
              </div>
              <div v-if="sessionResult" class="result-display">
                <pre>{{ JSON.stringify(sessionResult, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <!-- 排行榜 -->
          <div class="app-card">
            <h3>🏆 排行榜 (Sorted Set)</h3>
            <div class="leaderboard-demo">
              <div class="input-group">
                <input v-model="playerName" placeholder="玩家名" class="input-field">
                <input v-model="playerScore" type="number" placeholder="分数" class="input-field">
              </div>
              <div class="button-group">
                <button @click="addScore" class="action-btn">添加分数</button>
                <button @click="getLeaderboard" class="action-btn">获取排行榜</button>
                <button @click="getPlayerRank" class="action-btn">查询排名</button>
              </div>
              <div v-if="leaderboardResult" class="result-display">
                <div v-if="Array.isArray(leaderboardResult)">
                  <h4>🏆 排行榜 TOP 10</h4>
                  <div v-for="(player, index) in leaderboardResult" :key="index" class="rank-item">
                    <span class="rank">{{ index + 1 }}</span>
                    <span class="player">{{ player.name }}</span>
                    <span class="score">{{ player.score }}</span>
                  </div>
                </div>
                <div v-else>{{ leaderboardResult }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 监控面板 -->
      <div v-if="activeTab === 'monitoring'" class="tab-content">
        <div class="section-header">
          <h2>📊 性能监控</h2>
          <button @click="loadPerformanceMetrics" class="load-btn" :disabled="!redisOnline">
            刷新监控数据
          </button>
        </div>

        <div v-if="performanceMetrics" class="monitoring-grid">
          <div class="metric-card">
            <h3>🔢 命令统计</h3>
            <div class="commands-stats">
              <div v-for="(count, command) in performanceMetrics.commands" :key="command" class="command-stat">
                <span class="command-name">{{ command }}:</span>
                <span class="command-count">{{ count }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <h3>⏱️ 延迟统计</h3>
            <div class="latency-stats">
              <div class="latency-item">
                <span class="label">平均延迟:</span>
                <span class="value">{{ performanceMetrics.avgLatency }}ms</span>
              </div>
              <div class="latency-item">
                <span class="label">P50延迟:</span>
                <span class="value">{{ performanceMetrics.p50Latency }}ms</span>
              </div>
              <div class="latency-item">
                <span class="label">P95延迟:</span>
                <span class="value">{{ performanceMetrics.p95Latency }}ms</span>
              </div>
              <div class="latency-item">
                <span class="label">P99延迟:</span>
                <span class="value">{{ performanceMetrics.p99Latency }}ms</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <h3>🔄 连接信息</h3>
            <div class="connection-stats">
              <div class="conn-item">
                <span class="label">当前连接:</span>
                <span class="value">{{ performanceMetrics.currentConnections }}</span>
              </div>
              <div class="conn-item">
                <span class="label">总连接数:</span>
                <span class="value">{{ performanceMetrics.totalConnections }}</span>
              </div>
              <div class="conn-item">
                <span class="label">拒绝连接:</span>
                <span class="value">{{ performanceMetrics.rejectedConnections }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <h3>💽 键空间统计</h3>
            <div class="keyspace-stats">
              <div v-for="(info, db) in performanceMetrics.keyspace" :key="db" class="keyspace-item">
                <div class="db-name">{{ db }}</div>
                <div class="db-stats">
                  <span>键: {{ info.keys }}</span>
                  <span>过期: {{ info.expires }}</span>
                  <span>平均TTL: {{ info.avgTtl }}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-container">
      <div class="error-card">
        <h3>❌ {{ errorMessage }}</h3>
        <ul v-if="errorSolutions.length > 0" class="error-solutions">
          <li v-for="(solution, index) in errorSolutions" :key="index">
            {{ solution }}
          </li>
        </ul>
        <button @click="retryConnection" class="retry-btn">重试连接</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 响应式数据
const activeTab = ref('overview')
const redisOnline = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const errorSolutions = ref([])

// 系统概览数据
const systemOverview = ref(null)
const performanceMetrics = ref(null)

// 数据类型演示
const stringKey = ref('demo:string')
const stringValue = ref('Hello Redis!')
const stringResult = ref('')

const listKey = ref('demo:list')
const listValue = ref('')
const listResult = ref(null)

const setKey = ref('demo:set')
const setValue = ref('')
const setResult = ref(null)

const hashKey = ref('demo:hash')
const hashField = ref('')
const hashValue = ref('')
const hashResult = ref(null)

// 高级功能
const pubsubChannel = ref('demo:notifications')
const pubsubMessage = ref('{"type":"info","message":"测试消息"}')
const pubsubResults = ref([])

const transactionCommands = ref([])
const newCommand = ref('')
const transactionResult = ref(null)

const ttlKey = ref('demo:ttl')
const ttlValue = ref('临时数据')
const ttlSeconds = ref(60)
const ttlResult = ref('')

// 应用场景
const cacheKey = ref('user:1001')
const cacheExpiry = ref(300)
const cacheResult = ref(null)

const lockKey = ref('resource:lock')
const lockTimeout = ref(30)
const lockResult = ref(null)

const sessionId = ref('sess_' + Date.now())
const sessionData = ref('{"userId":1001,"username":"demo","loginTime":"' + new Date().toISOString() + '"}')
const sessionResult = ref(null)

const playerName = ref('Player1')
const playerScore = ref(1000)
const leaderboardResult = ref(null)

// 性能测试
const testType = ref('simple')
const testCount = ref(100)
const testResults = ref(null)

// 标签配置
const tabs = ref([
  { id: 'overview', name: '系统概览', icon: '📊' },
  { id: 'datatypes', name: '数据类型', icon: '🗃️' },
  { id: 'advanced', name: '高级功能', icon: '⚡' },
  { id: 'applications', name: '实际应用', icon: '💼' },
  { id: 'performance', name: '性能测试', icon: '📈' },
  { id: 'monitoring', name: '监控面板', icon: '📊' }
])

// API 请求方法
const apiRequest = async (url, options = {}) => {
  const baseUrl = 'http://localhost:8080'
  try {
    const response = await fetch(baseUrl + url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    return await response.json()
  } catch (error) {
    console.error('API请求失败:', error)
    errorMessage.value = 'API请求失败: ' + error.message
    errorSolutions.value = [
      '检查 Redis 服务是否正在运行',
      '确认后端服务器是否启动 (localhost:8080)',
      '检查网络连接',
      '查看浏览器控制台获取详细错误信息'
    ]
    return null
  }
}

// 检查 Redis 状态
const checkRedisStatus = async () => {
  try {
    const response = await apiRequest('/api/redis/health')
    redisOnline.value = response && response.code === 200
    if (!redisOnline.value) {
      errorMessage.value = 'Redis 服务器连接失败'
      errorSolutions.value = [
        '确保 Redis 服务器正在运行',
        '检查 Redis 配置和端口',
        '验证后端服务器的 Redis 连接配置'
      ]
    } else {
      errorMessage.value = ''
      errorSolutions.value = []
    }
  } catch {
    redisOnline.value = false
  }
}

// 加载系统概览
const loadSystemOverview = async () => {
  isLoading.value = true
  try {
    const response = await apiRequest('/api/redis/info')
    if (response && response.code === 200) {
      systemOverview.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

// String 操作
const setString = async () => {
  if (!stringKey.value || !stringValue.value) return
  const response = await apiRequest('/api/redis/string/set', {
    method: 'POST',
    body: JSON.stringify({ key: stringKey.value, value: stringValue.value })
  })
  if (response && response.code === 200) {
    stringResult.value = 'SET 成功'
  }
}

const getString = async () => {
  if (!stringKey.value) return
  const response = await apiRequest(`/api/redis/string/get?key=${stringKey.value}`)
  if (response && response.code === 200) {
    stringResult.value = response.data || '(nil)'
  }
}

const deleteString = async () => {
  if (!stringKey.value) return
  const response = await apiRequest(`/api/redis/string/delete?key=${stringKey.value}`, {
    method: 'DELETE'
  })
  if (response && response.code === 200) {
    stringResult.value = '删除成功'
  }
}

// List 操作
const pushList = async () => {
  if (!listKey.value || !listValue.value) return
  const response = await apiRequest('/api/redis/list/push', {
    method: 'POST',
    body: JSON.stringify({ key: listKey.value, value: listValue.value })
  })
  if (response && response.code === 200) {
    listResult.value = `推入成功，列表长度: ${response.data}`
    listValue.value = ''
  }
}

const popList = async () => {
  if (!listKey.value) return
  const response = await apiRequest(`/api/redis/list/pop?key=${listKey.value}`, {
    method: 'POST'
  })
  if (response && response.code === 200) {
    listResult.value = response.data || '列表为空'
  }
}

const getList = async () => {
  if (!listKey.value) return
  const response = await apiRequest(`/api/redis/list/range?key=${listKey.value}&start=0&end=-1`)
  if (response && response.code === 200) {
    listResult.value = response.data || []
  }
}

// Set 操作
const addSet = async () => {
  if (!setKey.value || !setValue.value) return
  const response = await apiRequest('/api/redis/set/add', {
    method: 'POST',
    body: JSON.stringify({ key: setKey.value, value: setValue.value })
  })
  if (response && response.code === 200) {
    setResult.value = `添加成功，集合大小: ${response.data}`
    setValue.value = ''
  }
}

const getSet = async () => {
  if (!setKey.value) return
  const response = await apiRequest(`/api/redis/set/members?key=${setKey.value}`)
  if (response && response.code === 200) {
    setResult.value = response.data || []
  }
}

const removeSet = async () => {
  if (!setKey.value || !setValue.value) return
  const response = await apiRequest('/api/redis/set/remove', {
    method: 'DELETE',
    body: JSON.stringify({ key: setKey.value, value: setValue.value })
  })
  if (response && response.code === 200) {
    setResult.value = response.data ? '删除成功' : '成员不存在'
  }
}

// Hash 操作
const setHash = async () => {
  if (!hashKey.value || !hashField.value || !hashValue.value) return
  const response = await apiRequest('/api/redis/hash/set', {
    method: 'POST',
    body: JSON.stringify({ key: hashKey.value, field: hashField.value, value: hashValue.value })
  })
  if (response && response.code === 200) {
    hashResult.value = '设置成功'
    hashField.value = ''
    hashValue.value = ''
  }
}

const getHash = async () => {
  if (!hashKey.value || !hashField.value) return
  const response = await apiRequest(`/api/redis/hash/get?key=${hashKey.value}&field=${hashField.value}`)
  if (response && response.code === 200) {
    hashResult.value = response.data || '(nil)'
  }
}

const getAllHash = async () => {
  if (!hashKey.value) return
  const response = await apiRequest(`/api/redis/hash/getall?key=${hashKey.value}`)
  if (response && response.code === 200) {
    hashResult.value = response.data || {}
  }
}

// 发布订阅
const publishMessage = async () => {
  if (!pubsubChannel.value || !pubsubMessage.value) return
  const response = await apiRequest('/api/redis/pubsub/publish', {
    method: 'POST',
    body: JSON.stringify({ channel: pubsubChannel.value, message: pubsubMessage.value })
  })
  if (response && response.code === 200) {
    pubsubResults.value.unshift({
      timestamp: new Date().toLocaleTimeString(),
      channel: pubsubChannel.value,
      message: pubsubMessage.value,
      type: 'published'
    })
  }
}

const subscribeChannel = async () => {
  if (!pubsubChannel.value) return
  // 这里应该建立 WebSocket 连接来接收实时消息
  // 为了演示，我们模拟一个订阅成功的消息
  pubsubResults.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    channel: pubsubChannel.value,
    message: '订阅成功',
    type: 'subscribed'
  })
}

const unsubscribeChannel = () => {
  pubsubResults.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    channel: pubsubChannel.value,
    message: '取消订阅',
    type: 'unsubscribed'
  })
}

// 事务操作
const addCommand = () => {
  if (newCommand.value.trim()) {
    transactionCommands.value.push(newCommand.value.trim())
    newCommand.value = ''
  }
}

const removeCommand = (index) => {
  transactionCommands.value.splice(index, 1)
}

const clearCommands = () => {
  transactionCommands.value = []
  transactionResult.value = null
}

const executeTransaction = async () => {
  if (transactionCommands.value.length === 0) return
  
  const response = await apiRequest('/api/redis/transaction/execute', {
    method: 'POST',
    body: JSON.stringify({ commands: transactionCommands.value })
  })
  
  if (response && response.code === 200) {
    transactionResult.value = response.data
  }
}

// TTL 操作
const setWithTTL = async () => {
  if (!ttlKey.value || !ttlValue.value || !ttlSeconds.value) return
  const response = await apiRequest('/api/redis/ttl/set', {
    method: 'POST',
    body: JSON.stringify({ 
      key: ttlKey.value, 
      value: ttlValue.value, 
      seconds: ttlSeconds.value 
    })
  })
  if (response && response.code === 200) {
    ttlResult.value = `设置成功，${ttlSeconds.value}秒后过期`
  }
}

const getTTL = async () => {
  if (!ttlKey.value) return
  const response = await apiRequest(`/api/redis/ttl/get?key=${ttlKey.value}`)
  if (response && response.code === 200) {
    const ttl = response.data
    if (ttl === -1) {
      ttlResult.value = '键存在但没有设置过期时间'
    } else if (ttl === -2) {
      ttlResult.value = '键不存在'
    } else {
      ttlResult.value = `剩余时间: ${ttl}秒`
    }
  }
}

const removeTTL = async () => {
  if (!ttlKey.value) return
  const response = await apiRequest(`/api/redis/ttl/persist?key=${ttlKey.value}`, {
    method: 'POST'
  })
  if (response && response.code === 200) {
    ttlResult.value = response.data ? '已移除过期时间' : '键不存在'
  }
}

// 缓存演示
const simulateCache = async () => {
  if (!cacheKey.value) return
  
  const startTime = Date.now()
  
  // 先尝试从缓存获取
  let response = await apiRequest(`/api/redis/cache/get?key=${cacheKey.value}`)
  
  if (response && response.code === 200 && response.data) {
    // 缓存命中
    cacheResult.value = {
      fromCache: true,
      responseTime: Date.now() - startTime,
      data: response.data
    }
  } else {
    // 缓存未命中，模拟数据库查询
    await new Promise(resolve => setTimeout(resolve, 100)) // 模拟数据库延迟
    
    const mockData = {
      id: cacheKey.value,
      name: '用户名称',
      email: 'user@example.com',
      lastLogin: new Date().toISOString()
    }
    
    // 保存到缓存
    await apiRequest('/api/redis/cache/set', {
      method: 'POST',
      body: JSON.stringify({ 
        key: cacheKey.value, 
        value: JSON.stringify(mockData),
        expiry: cacheExpiry.value
      })
    })
    
    cacheResult.value = {
      fromCache: false,
      responseTime: Date.now() - startTime,
      data: mockData
    }
  }
}

const clearCache = async () => {
  if (!cacheKey.value) return
  const response = await apiRequest(`/api/redis/cache/delete?key=${cacheKey.value}`, {
    method: 'DELETE'
  })
  if (response && response.code === 200) {
    cacheResult.value = { message: '缓存已清空' }
  }
}

// 分布式锁
const acquireLock = async () => {
  if (!lockKey.value) return
  const response = await apiRequest('/api/redis/lock/acquire', {
    method: 'POST',
    body: JSON.stringify({ 
      key: lockKey.value, 
      timeout: lockTimeout.value,
      identifier: 'client_' + Date.now()
    })
  })
  
  if (response && response.code === 200) {
    lockResult.value = {
      acquired: response.data.acquired,
      message: response.data.acquired ? '锁获取成功' : '锁已被其他客户端持有'
    }
  }
}

const releaseLock = async () => {
  if (!lockKey.value) return
  const response = await apiRequest('/api/redis/lock/release', {
    method: 'POST',
    body: JSON.stringify({ key: lockKey.value })
  })
  
  if (response && response.code === 200) {
    lockResult.value = {
      acquired: false,
      message: '锁已释放'
    }
  }
}

const checkLock = async () => {
  if (!lockKey.value) return
  const response = await apiRequest(`/api/redis/lock/status?key=${lockKey.value}`)
  
  if (response && response.code === 200) {
    lockResult.value = {
      acquired: response.data.locked,
      message: response.data.locked ? `锁被持有，剩余时间: ${response.data.ttl}秒` : '锁可用'
    }
  }
}

// 会话存储
const saveSession = async () => {
  if (!sessionId.value || !sessionData.value) return
  
  try {
    const data = JSON.parse(sessionData.value)
    const response = await apiRequest('/api/redis/session/save', {
      method: 'POST',
      body: JSON.stringify({ sessionId: sessionId.value, data })
    })
    
    if (response && response.code === 200) {
      sessionResult.value = { message: '会话保存成功', sessionId: sessionId.value }
    }
  } catch (error) {
    sessionResult.value = { error: '会话数据格式错误，请输入有效的JSON' }
  }
}

const getSession = async () => {
  if (!sessionId.value) return
  const response = await apiRequest(`/api/redis/session/get?sessionId=${sessionId.value}`)
  
  if (response && response.code === 200) {
    sessionResult.value = response.data || { message: '会话不存在或已过期' }
  }
}

const deleteSession = async () => {
  if (!sessionId.value) return
  const response = await apiRequest(`/api/redis/session/delete?sessionId=${sessionId.value}`, {
    method: 'DELETE'
  })
  
  if (response && response.code === 200) {
    sessionResult.value = { message: '会话删除成功' }
  }
}

// 排行榜操作
const addScore = async () => {
  if (!playerName.value || playerScore.value === undefined) return
  
  const response = await apiRequest('/api/redis/leaderboard/add', {
    method: 'POST',
    body: JSON.stringify({ 
      leaderboard: 'game:scores',
      member: playerName.value, 
      score: playerScore.value 
    })
  })
  
  if (response && response.code === 200) {
    leaderboardResult.value = `${playerName.value} 分数已更新`
    playerName.value = ''
    playerScore.value = 0
  }
}

const getLeaderboard = async () => {
  const response = await apiRequest('/api/redis/leaderboard/top?leaderboard=game:scores&count=10')
  
  if (response && response.code === 200) {
    leaderboardResult.value = response.data || []
  }
}

const getPlayerRank = async () => {
  if (!playerName.value) return
  const response = await apiRequest(`/api/redis/leaderboard/rank?leaderboard=game:scores&member=${playerName.value}`)
  
  if (response && response.code === 200) {
    const rank = response.data
    leaderboardResult.value = rank !== null ? `${playerName.value} 排名: ${rank + 1}` : '玩家不在排行榜中'
  }
}

// 性能测试
const runPerformanceTest = async () => {
  isLoading.value = true
  testResults.value = null
  
  try {
    const response = await apiRequest('/api/redis/performance/test', {
      method: 'POST',
      body: JSON.stringify({ 
        type: testType.value,
        count: testCount.value
      })
    })
    
    if (response && response.code === 200) {
      testResults.value = response.data
    }
  } finally {
    isLoading.value = false
  }
}

// 加载性能指标
const loadPerformanceMetrics = async () => {
  const response = await apiRequest('/api/redis/monitoring/metrics')
  if (response && response.code === 200) {
    performanceMetrics.value = response.data
  }
}

// 重试连接
const retryConnection = () => {
  errorMessage.value = ''
  errorSolutions.value = []
  checkRedisStatus()
}

// 生命周期
onMounted(() => {
  checkRedisStatus()
  loadSystemOverview()
})

onBeforeUnmount(() => {
  // 清理资源
})
</script>

<style scoped>
.redis-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 头部状态栏 */
.header-status {
  margin-bottom: 30px;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  font-size: 2em;
  margin-right: 15px;
}

.status-text h3 {
  margin: 0 0 5px 0;
  font-size: 1.3em;
}

.status-text p {
  margin: 0;
  opacity: 0.9;
}

.refresh-btn {
  margin-left: auto;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 标签导航 */
.tabs-container {
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 12px;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  color: #666;
}

.tab-button:hover {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.tab-button.active {
  background: #007bff;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.tab-icon {
  font-size: 1.1em;
}

/* 内容区域 */
.content-area {
  min-height: 500px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.load-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.load-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* 概览网格 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #007bff;
}

.info-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  color: #007bff;
  font-weight: 500;
}

/* 数据类型网格 */
.datatypes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.datatype-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #28a745;
}

.datatype-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-field {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.textarea-field {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.textarea-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #007bff;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.action-btn.success {
  background: #28a745;
}

.action-btn.success:hover {
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.action-btn.danger {
  background: #dc3545;
}

.action-btn.danger:hover {
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.result-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/* 高级功能网格 */
.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #ffc107;
}

.feature-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

/* 发布订阅 */
.pubsub-messages {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
}

.message-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9em;
}

.timestamp {
  color: #6c757d;
  min-width: 80px;
}

.channel {
  color: #007bff;
  font-weight: 500;
  min-width: 120px;
}

.content {
  color: #495057;
}

/* 事务 */
.command-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  min-height: 100px;
  max-height: 150px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 5px;
  font-family: 'Courier New', monospace;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
}

/* 应用场景网格 */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.app-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #17a2b8;
}

.app-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2em;
}

/* 缓存结果 */
.cache-result {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-type {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.result-type.from-cache {
  background: #d4edda;
  color: #155724;
}

.result-type.from-db {
  background: #f8d7da;
  color: #721c24;
}

.result-time {
  color: #6c757d;
  font-size: 0.9em;
}

.result-data {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

/* 锁状态 */
.lock-status {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.lock-status.acquired {
  background: #d4edda;
  color: #155724;
}

.lock-status.failed {
  background: #f8d7da;
  color: #721c24;
}

/* 排行榜 */
.rank-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 5px;
}

.rank {
  background: #007bff;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.player {
  flex: 1;
  font-weight: 500;
}

.score {
  color: #28a745;
  font-weight: bold;
}

/* 性能测试 */
.performance-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.test-config {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.test-config h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.config-group {
  margin-bottom: 15px;
}

.config-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.select-field {
  width: 100%;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}

.test-results {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.test-results h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.result-card h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.metric-item, .stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.metric-item:last-child, .stat-item:last-child {
  border-bottom: none;
}

/* 监控面板 */
.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #fd7e14;
}

.metric-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.commands-stats, .latency-stats, .connection-stats, .keyspace-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.command-stat, .latency-item, .conn-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.command-name, .label {
  font-weight: 500;
  color: #495057;
}

.command-count, .value {
  color: #007bff;
  font-weight: bold;
}

.keyspace-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
}

.db-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.db-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #6c757d;
}

/* 错误提示 */
.error-container {
  margin-top: 30px;
}

.error-card {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 12px;
  padding: 20px;
  color: #721c24;
}

.error-card h3 {
  margin: 0 0 15px 0;
}

.error-solutions {
  margin: 15px 0;
  padding-left: 20px;
}

.error-solutions li {
  margin-bottom: 8px;
}

.retry-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .redis-view {
    padding: 15px;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .overview-grid,
  .datatypes-grid,
  .advanced-grid,
  .applications-grid,
  .monitoring-grid {
    grid-template-columns: 1fr;
  }
  
  .performance-section {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

/* 内存和性能统计样式 */
.memory-stats, .performance-stats, .db-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.memory-item, .perf-item, .db-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.memory-item:last-child, .perf-item:last-child, .db-item:last-child {
  border-bottom: none;
}

/* 加载动画 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
</style> 