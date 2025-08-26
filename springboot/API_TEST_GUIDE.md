# 🚀 SpringBoot API 测试指南

## 📋 问题修复总结

我们已经修复了以下关键问题：

### 1. **API路径问题** ✅
- **问题**: 配置文件中设置了`context-path: /api`，控制器中又手动添加`/api`前缀
- **解决**: 移除配置文件中的`context-path`，只在控制器中使用`/api`前缀
- **结果**: API路径现在是正确的`/api/users`而不是`/api/api/users`

### 2. **字段兼容性问题** ✅
- **问题**: 前端期望`createTime`和`updateTime`字段
- **解决**: 在User实体类中添加了`@Transient`方法提供兼容性
- **结果**: 前端可以正常访问时间字段

### 3. **搜索功能优化** ✅
- **问题**: 搜索方法只搜索活跃用户
- **解决**: 修改搜索查询，搜索所有用户
- **结果**: 搜索功能更加灵活

## 🛠️ 启动步骤

### 1. 启动SpringBoot后端
```bash
cd Grand_Web/springboot
./mvnw spring-boot:run
```

### 2. 验证API是否正常
```bash
# 使用Node.js测试脚本
node test-api.js

# 或者使用curl命令
curl http://localhost:8080/api/system/health
curl http://localhost:8080/api/users
```

### 3. 启动前端应用
```bash
cd Grand_Web/web
npm run serve
```

## 🔍 API测试

### 健康检查
```bash
GET http://localhost:8080/api/system/health
```

### 系统信息
```bash
GET http://localhost:8080/api/system/info
```

### 用户管理
```bash
# 获取所有用户
GET http://localhost:8080/api/users

# 获取用户统计
GET http://localhost:8080/api/users/stats

# 搜索用户
GET http://localhost:8080/api/users/search?keyword=admin

# 分页获取用户
GET http://localhost:8080/api/users/page?page=0&size=10
```

## 📊 预期结果

### 健康检查响应
```json
{
  "code": 200,
  "message": "健康检查完成",
  "data": {
    "status": "UP",
    "components": {
      "diskSpace": {
        "status": "UP"
      }
    }
  }
}
```

### 用户列表响应
```json
{
  "code": 200,
  "message": "获取用户列表成功",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@codelearn.com",
      "role": "ADMIN",
      "status": 1,
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00"
    }
  ]
}
```

## 🐛 常见问题

### 1. 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :8080

# 杀死进程
taskkill /PID <进程ID> /F
```

### 2. 数据库连接问题
- H2数据库是内存数据库，应用重启后数据会丢失
- 检查H2控制台: http://localhost:8080/h2-console

### 3. 跨域问题
- 已配置CORS，允许所有来源
- 如果仍有问题，检查浏览器控制台

## 📝 下一步

1. 启动后端服务
2. 运行API测试脚本验证功能
3. 启动前端应用测试完整功能
4. 如果仍有问题，检查浏览器开发者工具的网络和控制台标签

## 🔗 相关链接

- H2数据库控制台: http://localhost:8080/h2-console
- SpringBoot Actuator: http://localhost:8080/actuator
- 前端应用: http://localhost:8081 