# Spring Cloud 微服务架构演示

这是一个完整的 Spring Cloud 微服务架构演示项目，包含以下组件：

## 项目结构

```
springcloud/
├── eureka-server/      # 服务注册中心 (端口: 8761)
├── gateway/           # API 网关 (端口: 8080)
├── user-service/      # 用户服务 (端口: 8081)
├── product-service/   # 产品服务 (端口: 8082)
├── start-all.bat     # Windows 启动脚本
└── README.md         # 说明文档
```

## 服务说明

### 1. Eureka Server (服务注册中心)
- 端口: 8761
- 功能: 服务注册与发现
- 访问地址: http://localhost:8761

### 2. Gateway (API 网关)
- 端口: 8080
- 功能: 统一入口，路由转发，负载均衡
- 路由规则:
  - `/api/users/**` → user-service
  - `/api/products/**` → product-service

### 3. User Service (用户服务)
- 端口: 8081
- 功能: 用户信息管理
- API 接口:
  - GET /users - 获取所有用户
  - GET /users/{id} - 根据ID获取用户
  - POST /users - 创建用户
  - PUT /users/{id} - 更新用户
  - DELETE /users/{id} - 删除用户
  - GET /users/info - 获取服务信息

### 4. Product Service (产品服务)
- 端口: 8082
- 功能: 产品信息管理
- API 接口:
  - GET /products - 获取所有产品
  - GET /products/{id} - 根据ID获取产品
  - GET /products/category/{category} - 根据分类获取产品
  - GET /products/search?name={name} - 搜索产品
  - POST /products - 创建产品
  - PUT /products/{id} - 更新产品
  - DELETE /products/{id} - 删除产品
  - GET /products/info - 获取服务信息

## 如何运行

### 方式一：使用启动脚本 (推荐)
```bash
# Windows
.\start-all.bat
```

### 方式二：手动启动
1. 启动 Eureka Server
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```

2. 启动用户服务
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

3. 启动产品服务
   ```bash
   cd product-service
   mvn spring-boot:run
   ```

4. 启动网关
   ```bash
   cd gateway
   mvn spring-boot:run
   ```

## 测试接口

### 通过网关访问 (推荐)
```bash
# 获取用户服务信息
curl http://localhost:8080/api/users/info

# 获取所有用户
curl http://localhost:8080/api/users

# 获取产品服务信息
curl http://localhost:8080/api/products/info

# 获取所有产品
curl http://localhost:8080/api/products
```

### 直接访问微服务
```bash
# 直接访问用户服务
curl http://localhost:8081/users

# 直接访问产品服务
curl http://localhost:8082/products
```

## 监控和管理

- Eureka 控制台: http://localhost:8761
- H2 数据库控制台 (用户服务): http://localhost:8081/h2-console
- H2 数据库控制台 (产品服务): http://localhost:8082/h2-console

## 技术栈

- Spring Boot 2.7.14
- Spring Cloud 2021.0.8
- Spring Data JPA
- H2 Database
- Maven
- Netflix Eureka
- Spring Cloud Gateway

## 注意事项

1. 确保 Java 8+ 和 Maven 已安装
2. 启动顺序很重要：先启动 Eureka，再启动微服务，最后启动网关
3. 如果端口被占用，请修改对应的 application.yml 文件
4. 所有服务都支持 CORS，可以直接在前端调用 