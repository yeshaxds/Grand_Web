<template>
  <div class="product-management">
    <div class="header">
      <h2>📦 产品管理</h2>
      <div class="header-actions">
        <input 
          v-model="searchTerm" 
          @input="searchProducts"
          type="text" 
          placeholder="搜索产品..."
          class="search-input"
        >
        <select v-model="selectedCategory" @change="filterByCategory" class="category-select">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button @click="showCreateModal = true" class="create-btn">
          ➕ 添加产品
        </button>
      </div>
    </div>
    
    <!-- 产品列表 -->
    <div class="products-grid" v-if="displayProducts.length > 0">
      <div 
        v-for="product in displayProducts" 
        :key="product.id"
        class="product-card"
      >
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description || '暂无描述' }}</p>
          <div class="product-meta">
            <span class="price">¥{{ product.price }}</span>
            <span class="stock" :class="{ 'low-stock': product.stock < 10 }">
              库存: {{ product.stock }}
            </span>
            <span class="category">{{ product.category }}</span>
          </div>
        </div>
        <div class="product-actions">
          <button @click="editProduct(product)" class="edit-btn">
            ✏️ 编辑
          </button>
          <button @click="deleteProduct(product.id)" class="delete-btn">
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <h3>{{ searchTerm || selectedCategory ? '未找到匹配的产品' : '暂无产品数据' }}</h3>
      <p>{{ searchTerm || selectedCategory ? '尝试更改搜索条件' : '点击"添加产品"按钮创建第一个产品' }}</p>
    </div>
    
    <!-- 创建/编辑产品模态框 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? '添加产品' : '编辑产品' }}</h3>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitProduct">
            <div class="form-group">
              <label>产品名称</label>
              <input 
                v-model="productForm.name" 
                type="text" 
                required
                placeholder="请输入产品名称"
              >
            </div>
            <div class="form-group">
              <label>产品描述</label>
              <textarea 
                v-model="productForm.description" 
                placeholder="请输入产品描述"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>价格</label>
              <input 
                v-model="productForm.price" 
                type="number" 
                step="0.01"
                min="0"
                required
                placeholder="请输入价格"
              >
            </div>
            <div class="form-group">
              <label>库存</label>
              <input 
                v-model="productForm.stock" 
                type="number" 
                min="0"
                required
                placeholder="请输入库存数量"
              >
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="productForm.category" required>
                <option value="">请选择分类</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModals" class="cancel-btn">
                取消
              </button>
              <button type="submit" class="submit-btn">
                {{ showCreateModal ? '创建' : '更新' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import springCloudService from '@/services/springCloudService'

// 响应式数据
    const products = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const currentProduct = ref(null)
    const searchTerm = ref('')
    const selectedCategory = ref('')
    
    const productForm = ref({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: ''
    })
    
    // 计算属性
    const categories = computed(() => {
      const uniqueCategories = [...new Set(products.value.map(p => p.category))]
      return uniqueCategories.filter(Boolean)
    })
    
    const displayProducts = computed(() => {
      let filtered = products.value
      
      // 按分类筛选
      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.category === selectedCategory.value)
      }
      
      // 按搜索词筛选
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        )
      }
      
      return filtered
    })
    
    // 获取产品列表
    const fetchProducts = async () => {
      loading.value = true
      try {
        products.value = await springCloudService.getProducts()
      } catch (error) {
        console.error('获取产品列表失败:', error)
        alert('获取产品列表失败，请检查服务是否正常运行')
      } finally {
        loading.value = false
      }
    }
    
    // 搜索产品
    const searchProducts = async () => {
      if (!searchTerm.value.trim()) {
        await fetchProducts()
        return
      }
      
      try {
        const results = await springCloudService.searchProducts(searchTerm.value)
        products.value = results
      } catch (error) {
        console.error('搜索产品失败:', error)
      }
    }
    
    // 按分类筛选
    const filterByCategory = async () => {
      if (!selectedCategory.value) {
        await fetchProducts()
        return
      }
      
      try {
        const results = await springCloudService.getProductsByCategory(selectedCategory.value)
        products.value = results
      } catch (error) {
        console.error('筛选产品失败:', error)
      }
    }
    
    // 编辑产品
    const editProduct = (product) => {
      currentProduct.value = product
      productForm.value = { ...product }
      showEditModal.value = true
    }
    
    // 删除产品
    const deleteProduct = async (id) => {
      if (!confirm('确定要删除这个产品吗？')) return
      
      try {
        await springCloudService.deleteProduct(id)
        await fetchProducts()
        alert('删除成功')
      } catch (error) {
        console.error('删除产品失败:', error)
        alert('删除失败')
      }
    }
    
    // 提交产品表单
    const submitProduct = async () => {
      try {
        const formData = {
          ...productForm.value,
          price: parseFloat(productForm.value.price),
          stock: parseInt(productForm.value.stock)
        }
        
        if (showCreateModal.value) {
          await springCloudService.createProduct(formData)
          alert('创建成功')
        } else {
          await springCloudService.updateProduct(currentProduct.value.id, formData)
          alert('更新成功')
        }
        
        closeModals()
        await fetchProducts()
      } catch (error) {
        console.error('操作失败:', error)
        alert('操作失败')
      }
    }
    
    // 关闭模态框
    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      currentProduct.value = null
      productForm.value = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: ''
      }
    }
    
    // 组件挂载时获取数据
    onMounted(fetchProducts)
</script>

<style scoped>
.product-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h2 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.category-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.create-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.create-btn:hover {
  background: #218838;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.product-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.product-info h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.description {
  color: #6c757d;
  margin: 8px 0;
  line-height: 1.4;
  font-size: 14px;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
}

.price {
  font-size: 1.4em;
  font-weight: bold;
  color: #e74c3c;
}

.stock {
  font-size: 14px;
  color: #28a745;
  font-weight: 500;
}

.stock.low-stock {
  color: #dc3545;
}

.category {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  align-self: flex-start;
}

.product-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  flex: 1;
}

.edit-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  flex: 1;
}

.delete-btn:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state h3 {
  margin-bottom: 10px;
}

/* 模态框样式 */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #5a6268;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #0056b3;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 18px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .search-input {
    width: 150px;
  }
}
</style> 