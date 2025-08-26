import { defineStore } from 'pinia'

// 定义WebSocket聊天store
export const useChatStore = defineStore('websocketChat', {
  // 状态 - 存储聊天数据
  state: () => ({
    // WebSocket连接实例
    websocket: null,
    // 连接状态
    isConnected: false,
    // 当前用户信息
    currentUser: {
      id: '',
      nickname: '',
      avatar: ''
    },
    // 聊天消息列表
    messages: [],
    // 在线用户列表
    onlineUsers: [],
    // 连接错误信息
    connectionError: '',
    // 正在连接状态
    isConnecting: false
  }),

  // getters - 计算属性
  getters: {
    // 获取消息数量
    messageCount: (state) => state.messages.length,
    // 获取在线用户数量
    onlineUserCount: (state) => state.onlineUsers.length,
    // 检查是否已设置用户信息
    hasUserInfo: (state) => !!state.currentUser.nickname,
    // 获取连接状态文本
    connectionStatus: (state) => {
      if (state.isConnecting) return '连接中...'
      if (state.isConnected) return '已连接'
      return '未连接'
    }
  },

  // actions - 修改状态的方法
  actions: {
    // 设置用户信息
    setUserInfo(userInfo) {
      this.currentUser = {
        id: userInfo.id || Date.now().toString(),
        nickname: userInfo.nickname,
        avatar: userInfo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.nickname}`
      }
    },

    // 连接WebSocket服务器
    connectWebSocket(serverUrl = 'ws://localhost:8080/websocket') {
      if (this.websocket) {
        this.disconnectWebSocket()
      }

      this.isConnecting = true
      this.connectionError = ''

      try {
        this.websocket = new WebSocket(serverUrl)

        // 连接建立时触发
        this.websocket.onopen = () => {
          console.log('WebSocket连接已建立')
          this.isConnected = true
          this.isConnecting = false
          this.connectionError = ''
          
          // 发送用户加入消息
          this.sendMessage({
            type: 'user_join',
            user: this.currentUser,
            timestamp: new Date().toISOString()
          })
        }

        // 接收到消息时触发
        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('解析消息失败:', error)
          }
        }

        // 连接关闭时触发
        this.websocket.onclose = (event) => {
          console.log('WebSocket连接已关闭', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false
          
          if (event.code !== 1000) { // 非正常关闭
            this.connectionError = '连接已断开'
          }
        }

        // 连接发生错误时触发
        this.websocket.onerror = (error) => {
          console.error('WebSocket连接错误:', error)
          this.connectionError = '连接失败，请检查服务器是否启动'
          this.isConnecting = false
        }

      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        this.connectionError = '无法连接到服务器'
        this.isConnecting = false
      }
    },

    // 断开WebSocket连接
    disconnectWebSocket() {
      if (this.websocket) {
        this.websocket.close(1000, '用户主动断开连接')
        this.websocket = null
      }
      this.isConnected = false
      this.isConnecting = false
      this.onlineUsers = []
    },

    // 处理接收到的消息
    handleMessage(data) {
      switch (data.type) {
        case 'chat_message':
          this.addMessage(data)
          break
        case 'user_join':
          this.handleUserJoin(data)
          break
        case 'user_leave':
          this.handleUserLeave(data)
          break
        case 'online_users':
          this.onlineUsers = data.users || []
          break
        case 'system_message':
          this.addSystemMessage(data.message)
          break
        default:
          console.log('未知消息类型:', data.type)
      }
    },

    // 发送聊天消息
    sendChatMessage(content) {
      if (!this.isConnected || !content.trim()) {
        return false
      }

      const message = {
        type: 'chat_message',
        id: Date.now().toString(),
        user: this.currentUser,
        content: content.trim(),
        timestamp: new Date().toISOString()
      }

      this.sendMessage(message)
      return true
    },

    // 发送消息到WebSocket服务器
    sendMessage(message) {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify(message))
      }
    },

    // 添加消息到聊天记录
    addMessage(message) {
      this.messages.push({
        id: message.id || Date.now().toString(),
        user: message.user,
        content: message.content,
        timestamp: message.timestamp,
        type: 'chat'
      })
      
      // 限制消息数量，只保留最近100条
      if (this.messages.length > 100) {
        this.messages.shift()
      }
    },

    // 添加系统消息
    addSystemMessage(content) {
      this.messages.push({
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        type: 'system'
      })
    },

    // 处理用户加入
    handleUserJoin(data) {
      if (data.user && data.user.id !== this.currentUser.id) {
        this.addSystemMessage(`${data.user.nickname} 加入了聊天`)
        
        // 更新在线用户列表
        const existingUser = this.onlineUsers.find(user => user.id === data.user.id)
        if (!existingUser) {
          this.onlineUsers.push(data.user)
        }
      }
    },

    // 处理用户离开
    handleUserLeave(data) {
      if (data.user) {
        this.addSystemMessage(`${data.user.nickname} 离开了聊天`)
        
        // 从在线用户列表中移除
        this.onlineUsers = this.onlineUsers.filter(user => user.id !== data.user.id)
      }
    },

    // 清空聊天记录
    clearMessages() {
      this.messages = []
    },

    // 重置store状态
    resetChat() {
      this.disconnectWebSocket()
      this.messages = []
      this.onlineUsers = []
      this.currentUser = {
        id: '',
        nickname: '',
        avatar: ''
      }
      this.connectionError = ''
    }
  }
}) 