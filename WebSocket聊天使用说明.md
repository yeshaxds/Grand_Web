# WebSocket实时聊天功能

## 功能介绍

这是一个基于WebSocket的实时聊天功能，类似于QQ、微信的聊天界面。支持多用户实时聊天，具有以下特性：

### 主要功能
- 🔗 **实时连接**：基于WebSocket的实时通信
- 💬 **即时聊天**：发送和接收文字消息
- 👥 **在线用户**：显示当前在线用户列表
- 🎭 **个性头像**：自动生成用户头像
- 📱 **响应式设计**：支持移动端和桌面端
- 🔄 **自动重连**：连接断开时提供重连功能

### 界面特色
- 类似微信/QQ的聊天气泡设计
- 自己的消息显示在右侧（蓝色气泡）
- 他人的消息显示在左侧（白色气泡）
- 系统消息居中显示（灰色背景）
- 实时连接状态指示器
- 在线用户侧边栏

## 快速开始

### 1. 启动WebSocket服务器

首先需要启动WebSocket服务器：

```bash
# 进入项目根目录
cd Grand_Web

# 安装服务器依赖（仅首次需要）
npm install ws

# 启动WebSocket服务器
node websocket-server.js
```

服务器启动后会显示：
```
WebSocket服务器已启动在端口 8080
连接地址: ws://localhost:8080/websocket
```

### 2. 访问聊天页面

1. 启动Vue开发服务器：
```bash
cd Grand_Web/web
npm run serve
```

2. 在浏览器中访问：`http://localhost:8080` （或Vue项目的实际端口）

3. 点击导航栏中的 **示例** → **WebSocket聊天**

### 3. 开始聊天

1. **设置用户信息**：
   - 输入您的昵称
   - 确认服务器地址（默认：`ws://localhost:8080/websocket`）
   - 点击"加入聊天"

2. **发送消息**：
   - 在底部输入框中输入消息
   - 按回车键或点击"发送"按钮
   - 消息会实时发送给所有在线用户

3. **查看在线用户**：
   - 右侧显示当前所有在线用户
   - 您的用户名会标记"(我)"

## 测试多用户聊天

要测试多用户聊天功能，可以：

1. **同一浏览器**：打开多个标签页，使用不同昵称加入聊天
2. **不同浏览器**：在Chrome、Firefox等不同浏览器中同时访问
3. **不同设备**：在手机、电脑等不同设备上同时访问

## 使用技术

### 前端技术栈
- **Vue 3**：使用Composition API
- **Pinia**：状态管理（Vuex的替代方案）
- **WebSocket API**：浏览器原生WebSocket支持
- **响应式CSS**：支持移动端适配

### 后端技术栈
- **Node.js**：JavaScript运行环境
- **ws库**：WebSocket服务器实现
- **原生WebSocket协议**：标准的WebSocket通信

## 代码结构

```
Grand_Web/
├── websocket-server.js          # WebSocket服务器
├── websocket-server-package.json # 服务器依赖配置
└── web/src/
    ├── stores/chatStore.js       # 聊天状态管理
    ├── views/WebSocketChatView.vue # 聊天页面组件
    └── router/index.js           # 路由配置（已添加聊天路由）
```

## 消息协议

WebSocket通信使用JSON格式，支持以下消息类型：

### 客户端发送
```javascript
// 用户加入
{ type: 'user_join', user: { id, nickname, avatar }, timestamp }

// 聊天消息
{ type: 'chat_message', id, user, content, timestamp }
```

### 服务器发送
```javascript
// 聊天消息广播
{ type: 'chat_message', id, user, content, timestamp }

// 用户加入通知
{ type: 'user_join', user, timestamp }

// 用户离开通知
{ type: 'user_leave', user, timestamp }

// 在线用户列表
{ type: 'online_users', users: [] }

// 系统消息
{ type: 'system_message', message, timestamp }
```

## 故障排除

### 常见问题

1. **连接失败**
   - 确保WebSocket服务器已启动
   - 检查端口8080是否被占用
   - 确认服务器地址正确

2. **消息发送失败**
   - 检查网络连接
   - 确认WebSocket连接状态为"已连接"
   - 尝试刷新页面重新连接

3. **无法看到其他用户**
   - 确保多个客户端连接到同一服务器
   - 检查浏览器控制台是否有错误信息

### 开发调试

- 打开浏览器开发者工具的Console查看日志
- WebSocket服务器控制台会显示连接和消息日志
- 可以在Network标签查看WebSocket连接状态

## 扩展功能

当前实现了基础的文字聊天功能，未来可以扩展：

- 📎 文件传输
- 🖼️ 图片发送
- 😊 表情包支持
- 🔒 私聊功能
- 📝 聊天记录保存
- 🔔 消息通知
- 👤 用户身份验证

## 注意事项

- 当前服务器仅适用于开发测试，生产环境需要考虑安全性和性能优化
- 聊天记录仅存储在客户端，刷新页面会丢失
- 服务器重启会断开所有连接
- 建议在局域网环境下测试多用户功能 