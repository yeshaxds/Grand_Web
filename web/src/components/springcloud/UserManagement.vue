<template>
  <div class="user-management">
    <div class="header">
      <h2>👥 用户管理</h2>
      <button @click="showCreateModal = true" class="create-btn">
        ➕ 添加用户
      </button>
    </div>
    
    <!-- 用户列表 -->
    <div class="users-grid" v-if="users.length > 0">
      <div 
        v-for="user in users" 
        :key="user.id"
        class="user-card"
      >
        <div class="user-info">
          <h3>{{ user.username }}</h3>
          <p>📧 {{ user.email }}</p>
          <p>📱 {{ user.phone || '未填写' }}</p>
          <p>📍 {{ user.address || '未填写' }}</p>
        </div>
        <div class="user-actions">
          <button @click="editUser(user)" class="edit-btn">
            ✏️ 编辑
          </button>
          <button @click="deleteUser(user.id)" class="delete-btn">
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <h3>暂无用户数据</h3>
      <p>点击"添加用户"按钮创建第一个用户</p>
    </div>
    
    <!-- 创建/编辑用户模态框 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? '添加用户' : '编辑用户' }}</h3>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUser">
            <div class="form-group">
              <label>用户名</label>
              <input 
                v-model="userForm.username" 
                type="text" 
                required
                placeholder="请输入用户名"
              >
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input 
                v-model="userForm.email" 
                type="email" 
                required
                placeholder="请输入邮箱"
              >
            </div>
            <div class="form-group">
              <label>电话</label>
              <input 
                v-model="userForm.phone" 
                type="tel" 
                placeholder="请输入电话"
              >
            </div>
            <div class="form-group">
              <label>地址</label>
              <input 
                v-model="userForm.address" 
                type="text" 
                placeholder="请输入地址"
              >
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
import { ref, onMounted } from 'vue'
import springCloudService from '@/services/springCloudService'

// 响应式数据
const users = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentUser = ref(null)

const userForm = ref({
  username: '',
  email: '',
  phone: '',
  address: ''
})

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await springCloudService.getUsers()
  } catch (error) {
    console.error('获取用户列表失败:', error)
    alert('获取用户列表失败，请检查服务是否正常运行')
  } finally {
    loading.value = false
  }
}

// 编辑用户
const editUser = (user) => {
  currentUser.value = user
  userForm.value = { ...user }
  showEditModal.value = true
}

// 删除用户
const deleteUser = async (id) => {
  if (!confirm('确定要删除这个用户吗？')) return
  
  try {
    await springCloudService.deleteUser(id)
    await fetchUsers()
    alert('删除成功')
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除失败')
  }
}

// 提交用户表单
const submitUser = async () => {
  try {
    if (showCreateModal.value) {
      await springCloudService.createUser(userForm.value)
      alert('创建成功')
    } else {
      await springCloudService.updateUser(currentUser.value.id, userForm.value)
      alert('更新成功')
    }
    
    closeModals()
    await fetchUsers()
  } catch (error) {
    console.error('操作失败:', error)
    alert('操作失败')
  }
}

// 关闭模态框
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentUser.value = null
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    address: ''
  }
}

// 组件挂载时获取数据
onMounted(fetchUsers)
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  color: #2c3e50;
  margin: 0;
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
}

.create-btn:hover {
  background: #218838;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.user-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.user-info h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.user-info p {
  margin: 5px 0;
  color: #6c757d;
}

.user-actions {
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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
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
</style> 