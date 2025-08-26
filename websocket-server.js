const WebSocket = require('ws');

// 创建WebSocket服务器
const wss = new WebSocket.Server({ 
  port: 8080,
  path: '/websocket'
});

// 存储在线用户
const connectedClients = new Map();

console.log('WebSocket服务器已启动在端口 8080');
console.log('连接地址: ws://localhost:8080/websocket');

// 广播消息给所有连接的客户端
function broadcast(message, excludeClient = null) {
  const messageStr = JSON.stringify(message);
  
  wss.clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// 发送在线用户列表
function sendOnlineUsers() {
  const users = Array.from(connectedClients.values());
  const message = {
    type: 'online_users',
    users: users
  };
  
  broadcast(message);
}

// 处理客户端连接
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`新客户端连接: ${clientIP}`);
  
  // 为连接分配一个唯一ID
  const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  ws.clientId = clientId;
  
  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`收到消息 [${message.type}]:`, message);
      
      switch (message.type) {
        case 'user_join':
          // 用户加入聊天
          if (message.user && message.user.nickname) {
            // 存储用户信息
            connectedClients.set(clientId, {
              id: message.user.id,
              nickname: message.user.nickname,
              avatar: message.user.avatar,
              joinTime: new Date().toISOString()
            });
            
            console.log(`用户加入: ${message.user.nickname}`);
            
            // 通知其他用户有新用户加入
            broadcast({
              type: 'user_join',
              user: message.user,
              timestamp: new Date().toISOString()
            }, ws);
            
            // 发送欢迎消息给新用户
            ws.send(JSON.stringify({
              type: 'system_message',
              message: '欢迎加入聊天室！',
              timestamp: new Date().toISOString()
            }));
            
            // 更新在线用户列表
            setTimeout(() => {
              sendOnlineUsers();
            }, 100);
          }
          break;
          
        case 'chat_message':
          // 聊天消息
          if (message.content && message.user) {
            console.log(`${message.user.nickname}: ${message.content}`);
            
            // 广播消息给所有客户端
            broadcast({
              type: 'chat_message',
              id: message.id,
              user: message.user,
              content: message.content,
              timestamp: new Date().toISOString()
            });
          }
          break;
          
        default:
          console.log('未知消息类型:', message.type);
      }
      
    } catch (error) {
      console.error('解析消息失败:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: '消息格式错误'
      }));
    }
  });
  
  // 处理连接关闭
  ws.on('close', (code, reason) => {
    console.log(`客户端断开连接: ${clientIP}, 代码: ${code}, 原因: ${reason}`);
    
    // 获取离开的用户信息
    const user = connectedClients.get(clientId);
    
    if (user) {
      console.log(`用户离开: ${user.nickname}`);
      
      // 通知其他用户有用户离开
      broadcast({
        type: 'user_leave',
        user: user,
        timestamp: new Date().toISOString()
      });
      
      // 从在线用户列表中移除
      connectedClients.delete(clientId);
      
      // 更新在线用户列表
      setTimeout(() => {
        sendOnlineUsers();
      }, 100);
    }
  });
  
  // 处理连接错误
  ws.on('error', (error) => {
    console.error(`WebSocket错误 [${clientIP}]:`, error);
  });
  
  // 发送连接成功消息
  ws.send(JSON.stringify({
    type: 'connection_success',
    message: '连接成功',
    timestamp: new Date().toISOString()
  }));
});

// 处理服务器错误
wss.on('error', (error) => {
  console.error('WebSocket服务器错误:', error);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭WebSocket服务器...');
  
  // 通知所有客户端服务器即将关闭
  broadcast({
    type: 'system_message',
    message: '服务器即将关闭，请稍后重新连接',
    timestamp: new Date().toISOString()
  });
  
  // 关闭所有连接
  wss.clients.forEach(client => {
    client.close(1001, '服务器关闭');
  });
  
  // 关闭服务器
  wss.close(() => {
    console.log('WebSocket服务器已关闭');
    process.exit(0);
  });
});

// 定期清理无效连接
setInterval(() => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // 发送心跳包
      client.ping();
    }
  });
}, 30000); // 每30秒发送一次心跳

console.log('\n=== WebSocket聊天服务器 ===');
console.log('服务器状态: 运行中');
console.log('端口: 8080');
console.log('路径: /websocket');
console.log('按 Ctrl+C 停止服务器');
console.log('=======================\n'); 