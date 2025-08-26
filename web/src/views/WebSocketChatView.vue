<template>
  <div class="websocket-chat-container">
    <!-- 页面标题 -->
    <div class="chat-header">
      <h1>WebSocket实时聊天</h1>
      <div class="connection-status">
        <span :class="['status-indicator', { 'connected': chatStore.isConnected, 'connecting': chatStore.isConnecting }]"></span>
        <span class="status-text">{{ chatStore.connectionStatus }}</span>
        <span v-if="chatStore.isConnected" class="online-count">({{ chatStore.onlineUserCount }} 人在线)</span>
      </div>
    </div>

    <!-- 连接错误提示 -->
    <div v-if="chatStore.connectionError" class="error-message">
      <span>{{ chatStore.connectionError }}</span>
      <button @click="reconnect" class="retry-button">重试连接</button>
    </div>

    <!-- 用户信息设置 -->
    <div v-if="!chatStore.hasUserInfo" class="user-setup">
      <div class="setup-card">
        <h3>请设置您的聊天信息</h3>
        <div class="input-group">
          <label>昵称：</label>
          <input 
            v-model="nickname" 
            type="text" 
            placeholder="请输入您的昵称"
            @keyup.enter="joinChat"
            maxlength="20"
          >
        </div>
        <div class="input-group">
          <label>服务器地址：</label>
          <input 
            v-model="serverUrl" 
            type="text" 
            placeholder="ws://localhost:8080/websocket"
          >
        </div>
        <button @click="joinChat" :disabled="!nickname.trim() || chatStore.isConnecting" class="join-button">
          {{ chatStore.isConnecting ? '连接中...' : '加入聊天' }}
        </button>
      </div>
    </div>

    <!-- 聊天主界面 -->
    <div v-else class="chat-main">
      <!-- 左侧聊天区域 -->
      <div class="chat-area">
        <!-- 聊天消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in chatStore.messages" 
            :key="message.id"
            :class="['message-item', { 
              'own-message': message.user && message.user.id === chatStore.currentUser.id,
              'system-message': message.type === 'system'
            }]"
          >
            <!-- 系统消息 -->
            <div v-if="message.type === 'system'" class="system-message-content">
              <span>{{ message.content }}</span>
            </div>
            
            <!-- 用户消息 -->
            <div v-else class="user-message">
              <!-- 头像 -->
              <div class="message-avatar">
                <img :src="message.user.avatar" :alt="message.user.nickname">
              </div>
              
              <!-- 消息内容 -->
              <div class="message-content">
                <div class="message-header">
                  <span class="nickname">{{ message.user.nickname }}</span>
                  <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </div>
          
          <!-- 无消息提示 -->
          <div v-if="chatStore.messageCount === 0" class="no-messages">
            <p>还没有消息，开始聊天吧！</p>
          </div>
        </div>

        <!-- 消息输入区域 -->
        <div class="message-input-area">
          <div class="input-container">
            <input
              v-model="newMessage"
              type="text"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              :disabled="!chatStore.isConnected"
              maxlength="500"
              class="message-input"
            >
            <button 
              @click="sendMessage" 
              :disabled="!chatStore.isConnected || !newMessage.trim()"
              class="send-button"
            >
              发送
            </button>
          </div>
          <div class="input-actions">
            <button @click="clearMessages" class="action-button">清空消息</button>
            <button @click="disconnect" class="action-button danger">断开连接</button>
          </div>
        </div>
      </div>

      <!-- 右侧用户列表 -->
      <div class="users-sidebar">
        <h3>在线用户 ({{ chatStore.onlineUserCount }})</h3>
        <div class="users-list">
          <div 
            v-for="user in chatStore.onlineUsers" 
            :key="user.id"
            :class="['user-item', { 'current-user': user.id === chatStore.currentUser.id }]"
          >
            <img :src="user.avatar" :alt="user.nickname" class="user-avatar">
            <span class="user-nickname">{{ user.nickname }}</span>
            <span v-if="user.id === chatStore.currentUser.id" class="user-badge">(我)</span>
          </div>
          
          <!-- 无在线用户提示 -->
          <div v-if="chatStore.onlineUserCount === 0" class="no-users">
            <p>暂无其他用户在线</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'

export default {
  name: 'WebSocketChatView',
  setup() {
    const chatStore = useChatStore()
    
    // 响应式数据
    const nickname = ref('')
    const serverUrl = ref('ws://localhost:8080/websocket')
    const newMessage = ref('')
    const messagesContainer = ref(null)

    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    // 滚动到消息列表底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    // 加入聊天
    const joinChat = () => {
      if (!nickname.value.trim()) {
        alert('请输入昵称')
        return
      }

      // 设置用户信息
      chatStore.setUserInfo({
        nickname: nickname.value.trim()
      })

      // 连接WebSocket服务器
      chatStore.connectWebSocket(serverUrl.value)
    }

    // 发送消息
    const sendMessage = () => {
      if (!newMessage.value.trim()) return

      const success = chatStore.sendChatMessage(newMessage.value)
      if (success) {
        newMessage.value = ''
        scrollToBottom()
      }
    }

    // 重新连接
    const reconnect = () => {
      chatStore.connectWebSocket(serverUrl.value)
    }

    // 清空消息
    const clearMessages = () => {
      if (confirm('确定要清空所有消息吗？')) {
        chatStore.clearMessages()
      }
    }

    // 断开连接
    const disconnect = () => {
      if (confirm('确定要断开连接吗？')) {
        chatStore.resetChat()
      }
    }

    // 监听消息变化，自动滚动到底部
    const unwatchMessages = watch(
      () => chatStore.messages.length,
      () => {
        nextTick(() => {
          scrollToBottom()
        })
      }
    )

    // 组件挂载时
    onMounted(() => {
      // 如果用户已经设置过信息，自动连接
      if (chatStore.hasUserInfo) {
        chatStore.connectWebSocket(serverUrl.value)
      }
    })

    // 组件卸载时断开连接
    onBeforeUnmount(() => {
      unwatchMessages()
      chatStore.disconnectWebSocket()
    })

    return {
      chatStore,
      nickname,
      serverUrl,
      newMessage,
      messagesContainer,
      formatTime,
      joinChat,
      sendMessage,
      reconnect,
      clearMessages,
      disconnect
    }
  }
}
</script>

<style scoped>
.websocket-chat-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 10px;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chat-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e74c3c;
  transition: background-color 0.3s;
}

.status-indicator.connecting {
  background: #f39c12;
  animation: pulse 1.5s infinite;
}

.status-indicator.connected {
  background: #27ae60;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-weight: 500;
  color: #34495e;
}

.online-count {
  color: #7f8c8d;
  font-size: 14px;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-button {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background: rgba(255,255,255,0.3);
}

.user-setup {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.setup-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.setup-card h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #34495e;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: #3498db;
}

.join-button {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.join-button:hover:not(:disabled) {
  background: #2980b9;
}

.join-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.chat-main {
  flex: 1;
  display: flex;
  gap: 20px;
  height: 100%;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.message-item {
  margin-bottom: 15px;
}

.system-message {
  text-align: center;
}

.system-message-content {
  display: inline-block;
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.user-message {
  display: flex;
  gap: 10px;
}

.own-message .user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #ecf0f1;
}

.message-content {
  max-width: 70%;
}

.own-message .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.own-message .message-header {
  flex-direction: row-reverse;
}

.nickname {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.timestamp {
  color: #95a5a6;
  font-size: 12px;
}

.message-text {
  background: white;
  padding: 10px 15px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-wrap: break-word;
}

.own-message .message-text {
  background: #3498db;
  color: white;
}

.no-messages {
  text-align: center;
  color: #95a5a6;
  margin-top: 50px;
}

.message-input-area {
  padding: 20px;
  border-top: 1px solid #ecf0f1;
  background: white;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.message-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
}

.message-input:focus {
  outline: none;
  border-color: #3498db;
}

.send-button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover:not(:disabled) {
  background: #2980b9;
}

.send-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-button {
  padding: 5px 15px;
  border: 1px solid #ddd;
  background: white;
  color: #7f8c8d;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.action-button:hover {
  background: #ecf0f1;
}

.action-button.danger {
  border-color: #e74c3c;
  color: #e74c3c;
}

.action-button.danger:hover {
  background: #e74c3c;
  color: white;
}

.users-sidebar {
  width: 250px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
}

.users-sidebar h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
  text-align: center;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 10px;
}

.users-list {
  space-y: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;
  margin-bottom: 8px;
}

.user-item:hover {
  background: #f8f9fa;
}

.current-user {
  background: #e3f2fd;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ecf0f1;
}

.user-nickname {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.user-badge {
  font-size: 12px;
  color: #3498db;
  font-weight: 500;
}

.no-users {
  text-align: center;
  color: #95a5a6;
  margin-top: 30px;
}

.no-users p {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-main {
    flex-direction: column;
  }
  
  .users-sidebar {
    width: 100%;
    max-height: 200px;
  }
  
  .websocket-chat-container {
    margin: 10px;
    padding: 10px;
    height: calc(100vh - 80px);
  }
}
</style> 