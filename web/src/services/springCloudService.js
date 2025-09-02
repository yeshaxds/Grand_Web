/**
 * Spring Cloud 微服务 API 服务
 */

const BASE_URL = 'http://localhost:8080' // Gateway 网关地址

class SpringCloudService {
  
  /**
   * 发送HTTP请求的通用方法
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('请求失败:', error)
      throw error
    }
  }
  
  /**
   * 获取服务注册信息 (直接访问Eureka)
   */
  async getServiceRegistry() {
    try {
      const response = await fetch('http://localhost:8761/eureka/apps', {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('无法获取服务注册信息')
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取服务注册信息失败:', error)
      throw error
    }
  }
  
  /**
   * 获取用户服务信息
   */
  async getUserServiceInfo() {
    return this.request(`${BASE_URL}/api/users/info`)
  }
  
  /**
   * 获取产品服务信息
   */
  async getProductServiceInfo() {
    return this.request(`${BASE_URL}/api/products/info`)
  }
  
  /**
   * 获取所有用户
   */
  async getUsers() {
    return this.request(`${BASE_URL}/api/users`)
  }
  
  /**
   * 获取用户详情
   */
  async getUserById(id) {
    return this.request(`${BASE_URL}/api/users/${id}`)
  }
  
  /**
   * 创建用户
   */
  async createUser(userData) {
    return this.request(`${BASE_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }
  
  /**
   * 更新用户
   */
  async updateUser(id, userData) {
    return this.request(`${BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }
  
  /**
   * 删除用户
   */
  async deleteUser(id) {
    return this.request(`${BASE_URL}/api/users/${id}`, {
      method: 'DELETE'
    })
  }
  
  /**
   * 获取所有产品
   */
  async getProducts() {
    return this.request(`${BASE_URL}/api/products`)
  }
  
  /**
   * 获取产品详情
   */
  async getProductById(id) {
    return this.request(`${BASE_URL}/api/products/${id}`)
  }
  
  /**
   * 根据分类获取产品
   */
  async getProductsByCategory(category) {
    return this.request(`${BASE_URL}/api/products/category/${category}`)
  }
  
  /**
   * 搜索产品
   */
  async searchProducts(name) {
    return this.request(`${BASE_URL}/api/products/search?name=${encodeURIComponent(name)}`)
  }
  
  /**
   * 创建产品
   */
  async createProduct(productData) {
    return this.request(`${BASE_URL}/api/products`, {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  }
  
  /**
   * 更新产品
   */
  async updateProduct(id, productData) {
    return this.request(`${BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
  }
  
  /**
   * 删除产品
   */
  async deleteProduct(id) {
    return this.request(`${BASE_URL}/api/products/${id}`, {
      method: 'DELETE'
    })
  }
  
  /**
   * 检查服务健康状态
   */
  async checkServiceHealth(serviceUrl) {
    try {
      const response = await fetch(serviceUrl, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  /**
   * 获取所有服务状态
   */
  async getAllServicesStatus() {
    const services = [
      { name: 'Eureka Server', url: 'http://localhost:8761', port: 8761 },
      { name: 'Gateway', url: 'http://localhost:8080', port: 8080 },
      { name: 'User Service', url: 'http://localhost:8081', port: 8081 },
      { name: 'Product Service', url: 'http://localhost:8082', port: 8082 }
    ]
    
    const results = await Promise.all(
      services.map(async (service) => {
        const isHealthy = await this.checkServiceHealth(service.url)
        return {
          ...service,
          status: isHealthy ? 'running' : 'stopped'
        }
      })
    )
    
    return results
  }
}

export default new SpringCloudService() 