<template>
  <div class="service-monitoring">
    <div class="header">
      <h2>📈 服务监控</h2>
      <button @click="refreshAll" class="refresh-btn" :disabled="loading">
        🔄 {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </div>
    
    <!-- 服务健康状态 -->
    <div class="health-status">
      <h3>🏥 服务健康状态</h3>
      <div class="health-grid">
        <div 
          v-for="service in servicesHealth" 
          :key="service.name"
          class="health-card"
          :class="service.status"
        >
          <div class="health-indicator">
            <span class="health-dot" :class="service.status"></span>
            <span class="health-text">{{ getStatusText(service.status) }}</span>
          </div>
          <h4>{{ service.name }}</h4>
          <p>{{ service.url }}</p>
          <div class="health-meta">
            <span>端口: {{ service.port }}</span>
            <span>响应时间: {{ service.responseTime || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 服务统计信息 -->
    <div class="service-stats">
      <h3>📊 服务统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h4>{{ runningServices }}</h4>
            <p>运行中服务</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <h4>{{ stoppedServices }}</h4>
            <p>停止服务</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <h4>{{ uptime }}</h4>
            <p>系统运行时间</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <h4>{{ lastUpdate }}</h4>
            <p>最后更新时间</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 服务详细信息 -->
    <div class="service-details">
      <h3>🔍 服务详细信息</h3>
      <div class="details-grid">
        <!-- 用户服务信息 -->
        <div class="detail-card" v-if="userServiceInfo">
          <h4>👥 {{ userServiceInfo.serviceName }}</h4>
          <div class="service-info">
            <p><strong>端口:</strong> {{ userServiceInfo.port }}</p>
            <p><strong>状态:</strong> <span class="status-badge running">{{ userServiceInfo.status }}</span></p>
            <p><strong>描述:</strong> {{ userServiceInfo.description }}</p>
          </div>
        </div>
        
        <!-- 产品服务信息 -->
        <div class="detail-card" v-if="productServiceInfo">
          <h4>📦 {{ productServiceInfo.serviceName }}</h4>
          <div class="service-info">
            <p><strong>端口:</strong> {{ productServiceInfo.port }}</p>
            <p><strong>状态:</strong> <span class="status-badge running">{{ productServiceInfo.status }}</span></p>
            <p><strong>描述:</strong> {{ productServiceInfo.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 服务注册信息 -->
    <div class="registry-details" v-if="registryData">
      <h3>🏷️ Eureka 注册信息</h3>
      <div class="registry-content">
        <div v-if="registryData.applications && registryData.applications.application">
          <div 
            v-for="app in registryData.applications.application" 
            :key="app.name"
            class="registry-card"
          >
            <div class="registry-header">
              <h4>{{ app.name }}</h4>
              <span class="instance-count">
                实例数: {{ getInstanceCount(app.instance) }}
              </span>
            </div>
            <div v-if="app.instance" class="instances-list">
              <div 
                v-for="(instance, index) in (Array.isArray(app.instance) ? app.instance : [app.instance])"
                :key="index"
                class="instance-item"
              >
                <div class="instance-info">
                  <span class="instance-id">{{ instance.instanceId }}</span>
                  <span class="instance-status" :class="instance.status.toLowerCase()">
                    {{ instance.status }}
                  </span>
                </div>
                <div class="instance-details">
                  <span>{{ instance.homePageUrl }}</span>
                  <span>健康检查: {{ instance.healthCheckUrl || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-registry">
          暂无服务注册信息
        </div>
      </div>
    </div>
    
    <!-- 监控工具链接 -->
    <div class="monitoring-links">
      <h3>🔗 监控工具</h3>
      <div class="links-grid">
        <a href="http://localhost:8761" target="_blank" class="link-card">
          <div class="link-icon">🏠</div>
          <div class="link-info">
            <h4>Eureka 控制台</h4>
            <p>服务注册中心</p>
          </div>
        </a>
        <a href="http://localhost:8081/h2-console" target="_blank" class="link-card">
          <div class="link-icon">🗄️</div>
          <div class="link-info">
            <h4>用户数据库</h4>
            <p>H2 控制台</p>
          </div>
        </a>
        <a href="http://localhost:8082/h2-console" target="_blank" class="link-card">
          <div class="link-icon">🗄️</div>
          <div class="link-info">
            <h4>产品数据库</h4>
            <p>H2 控制台</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import springCloudService from '@/services/springCloudService'

// 响应式数据
    const loading = ref(false)
    const servicesHealth = ref([])
    const userServiceInfo = ref(null)
    const productServiceInfo = ref(null)
    const registryData = ref(null)
    const startTime = ref(new Date())
    const currentTime = ref(new Date())
    let refreshInterval = null
    
    // 计算属性
    const runningServices = computed(() => {
      return servicesHealth.value.filter(s => s.status === 'running').length
    })
    
    const stoppedServices = computed(() => {
      return servicesHealth.value.filter(s => s.status === 'stopped').length
    })
    
    const uptime = computed(() => {
      const diff = currentTime.value - startTime.value
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}时${minutes}分`
    })
    
    const lastUpdate = computed(() => {
      return currentTime.value.toLocaleTimeString()
    })
    
    // 获取状态文本
    const getStatusText = (status) => {
      return status === 'running' ? '运行中' : '已停止'
    }
    
    // 获取实例数量
    const getInstanceCount = (instances) => {
      if (!instances) return 0
      return Array.isArray(instances) ? instances.length : 1
    }
    
    // 获取服务健康状态
    const checkServicesHealth = async () => {
      try {
        const services = await springCloudService.getAllServicesStatus()
        // 添加响应时间检测
        for (const service of services) {
          const startTime = Date.now()
          try {
            await fetch(service.url, { 
              method: 'HEAD', 
              mode: 'no-cors',
              timeout: 5000 
            })
            service.responseTime = `${Date.now() - startTime}ms`
          } catch {
            service.responseTime = 'N/A'
          }
        }
        servicesHealth.value = services
      } catch (error) {
        console.error('获取服务健康状态失败:', error)
      }
    }
    
    // 获取服务信息
    const getServiceInfo = async () => {
      try {
        const [userInfo, productInfo] = await Promise.all([
          springCloudService.getUserServiceInfo().catch(() => null),
          springCloudService.getProductServiceInfo().catch(() => null)
        ])
        
        userServiceInfo.value = userInfo
        productServiceInfo.value = productInfo
      } catch (error) {
        console.error('获取服务信息失败:', error)
      }
    }
    
    // 获取注册信息
    const getRegistryInfo = async () => {
      try {
        registryData.value = await springCloudService.getServiceRegistry()
      } catch (error) {
        console.error('获取注册信息失败:', error)
      }
    }
    
    // 刷新所有数据
    const refreshAll = async () => {
      loading.value = true
      try {
        await Promise.all([
          checkServicesHealth(),
          getServiceInfo(),
          getRegistryInfo()
        ])
        currentTime.value = new Date()
      } catch (error) {
        console.error('刷新数据失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 初始化
    onMounted(async () => {
      await refreshAll()
      
      // 设置定时刷新
      refreshInterval = setInterval(() => {
        refreshAll()
      }, 30000) // 每30秒刷新一次
      
      // 更新当前时间
      setInterval(() => {
        currentTime.value = new Date()
      }, 1000)
    })
    
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })
</script>

<style scoped>
.service-monitoring {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 健康状态 */
.health-status {
  margin-bottom: 30px;
}

.health-status h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.health-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.health-card.running {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.health-card.stopped {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.health-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.health-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.health-dot.running {
  background: #28a745;
  animation: pulse 2s infinite;
}

.health-dot.stopped {
  background: #dc3545;
}

.health-text {
  font-weight: bold;
  color: #2c3e50;
}

.health-card h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.health-card p {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
}

.health-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 统计信息 */
.service-stats {
  margin-bottom: 30px;
}

.service-stats h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2em;
}

.stat-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

/* 服务详细信息 */
.service-details {
  margin-bottom: 30px;
}

.service-details h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.detail-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.service-info p {
  margin: 8px 0;
  color: #6c757d;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.running {
  background: #d4edda;
  color: #155724;
}

/* 注册信息 */
.registry-details {
  margin-bottom: 30px;
}

.registry-details h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.registry-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.registry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.registry-header h4 {
  margin: 0;
  color: #2c3e50;
}

.instance-count {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.instance-item {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.instance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.instance-id {
  font-weight: 500;
  color: #2c3e50;
}

.instance-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
}

.instance-status.up {
  background: #d4edda;
  color: #155724;
}

.instance-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: #6c757d;
}

.no-registry {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

/* 监控链接 */
.monitoring-links h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.link-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-decoration: none;
}

.link-icon {
  font-size: 2em;
}

.link-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.link-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}
</style> 