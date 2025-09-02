<template>
  <div class="spring-cloud-container">
    <div class="header">
      <h1>🚀 Spring Cloud 微服务管理</h1>
      <p>基于 Spring Cloud 的分布式微服务架构演示</p>
    </div>
    
    <!-- 服务状态监控 -->
    <div class="services-status">
      <h2>📊 服务状态监控</h2>
      <div class="status-grid">
        <div 
          v-for="service in servicesStatus" 
          :key="service.name"
          class="status-card"
          :class="service.status"
        >
          <div class="status-indicator">
            <span 
              class="status-dot" 
              :class="service.status"
            ></span>
            {{ service.status === 'running' ? '运行中' : '已停止' }}
          </div>
          <h3>{{ service.name }}</h3>
          <p>端口: {{ service.port }}</p>
          <p>地址: {{ service.url }}</p>
        </div>
      </div>
      <button @click="refreshServicesStatus" class="refresh-btn">
        🔄 刷新状态
      </button>
    </div>
    
    <!-- 服务注册信息 -->
    <div class="registry-info" v-if="registryData">
      <h2>🏷️ 服务注册信息</h2>
      <div class="registry-content">
        <div v-if="registryData.applications && registryData.applications.application">
          <div 
            v-for="app in registryData.applications.application" 
            :key="app.name"
            class="app-card"
          >
            <h3>{{ app.name }}</h3>
            <div v-if="app.instance" class="instances">
              <div 
                v-for="(instance, index) in (Array.isArray(app.instance) ? app.instance : [app.instance])"
                :key="index"
                class="instance"
              >
                <span class="instance-id">{{ instance.instanceId }}</span>
                <span class="instance-status" :class="instance.status.toLowerCase()">
                  {{ instance.status }}
                </span>
                <span class="instance-url">{{ instance.homePageUrl }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-services">
          暂无已注册的服务
        </div>
      </div>
    </div>
    
    <!-- 功能导航 -->
    <div class="features-nav">
      <h2>🛠️ 微服务功能</h2>
      <div class="nav-grid">
        <div 
          class="nav-card" 
          @click="activeTab = 'users'"
          :class="{ active: activeTab === 'users' }"
        >
          <div class="nav-icon">👥</div>
          <h3>用户管理</h3>
          <p>管理系统用户信息</p>
        </div>
        <div 
          class="nav-card" 
          @click="activeTab = 'products'"
          :class="{ active: activeTab === 'products' }"
        >
          <div class="nav-icon">📦</div>
          <h3>产品管理</h3>
          <p>管理产品库存信息</p>
        </div>
        <div 
          class="nav-card" 
          @click="activeTab = 'monitoring'"
          :class="{ active: activeTab === 'monitoring' }"
        >
          <div class="nav-icon">📈</div>
          <h3>服务监控</h3>
          <p>监控微服务状态</p>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 用户管理 -->
      <UserManagement v-if="activeTab === 'users'" />
      
      <!-- 产品管理 -->
      <ProductManagement v-if="activeTab === 'products'" />
      
      <!-- 服务监控 -->
      <ServiceMonitoring v-if="activeTab === 'monitoring'" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import springCloudService from '@/services/springCloudService'
import UserManagement from '@/components/springcloud/UserManagement.vue'
import ProductManagement from '@/components/springcloud/ProductManagement.vue'
import ServiceMonitoring from '@/components/springcloud/ServiceMonitoring.vue'

export default {
  name: 'SpringCloudView',
  components: {
    UserManagement,
    ProductManagement,
    ServiceMonitoring
  },
  setup() {
    const activeTab = ref('users')
    const servicesStatus = ref([])
    const registryData = ref(null)
    
    // 获取服务状态
    const refreshServicesStatus = async () => {
      try {
        servicesStatus.value = await springCloudService.getAllServicesStatus()
      } catch (error) {
        console.error('获取服务状态失败:', error)
      }
    }
    
    // 获取服务注册信息
    const getRegistryInfo = async () => {
      try {
        registryData.value = await springCloudService.getServiceRegistry()
      } catch (error) {
        console.error('获取服务注册信息失败:', error)
      }
    }
    
    // 初始化
    onMounted(async () => {
      await refreshServicesStatus()
      await getRegistryInfo()
      
      // 定时刷新状态
      setInterval(refreshServicesStatus, 30000) // 每30秒刷新一次
    })
    
    return {
      activeTab,
      servicesStatus,
      registryData,
      refreshServicesStatus
    }
  }
}
</script>

<style scoped>
.spring-cloud-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 1.2em;
}

/* 服务状态监控 */
.services-status {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.status-card {
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.status-card.running {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.status-card.stopped {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.running {
  background: #4caf50;
  animation: pulse 2s infinite;
}

.status-dot.stopped {
  background: #f44336;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.refresh-btn:hover {
  background: #0056b3;
}

/* 服务注册信息 */
.registry-info {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.app-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.app-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.instances {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.instance {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.instance-status {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
}

.instance-status.up {
  background: #d4edda;
  color: #155724;
}

/* 功能导航 */
.features-nav {
  margin-bottom: 30px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.nav-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.nav-card.active {
  border: 2px solid #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.nav-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.nav-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.nav-card p {
  color: #7f8c8d;
}

/* 内容区域 */
.content-area {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.no-services {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}
</style> 