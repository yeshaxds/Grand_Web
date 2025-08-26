# CodeLearn SpringBoot 后端项目

## 📖 项目简介

这是一个完整的SpringBoot演示项目，展示了SpringBoot框架的核心功能和最佳实践。项目包含了用户管理、系统监控、缓存、安全等企业级应用的常见需求。

## 🚀 快速开始

### 前置要求
- Java 17 或更高版本
- Maven 3.6 或更高版本
- (可选) Redis服务器（用于缓存功能）

### 启动应用

#### Windows系统
```bash
# 直接运行启动脚本
start.bat

# 或者使用Maven命令
mvn spring-boot:run
```

#### Linux/Mac系统
```bash
# 使用Maven启动
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/demo-backend-1.0.0.jar
```

### 访问地址
- **应用主页**: http://localhost:8080/api
- **H2数据库控制台**: http://localhost:8080/api/h2-console
- **健康检查**: http://localhost:8080/api/actuator/health
- **系统监控**: http://localhost:8080/api/actuator
- **用户API**: http://localhost:8080/api/users

## 🏗️ 项目结构

```
src/main/java/com/codelearn/
├── DemoBackendApplication.java     # 主启动类
├── common/                         # 公共类
│   └── ResponseResult.java         # 统一响应结果
├── config/                         # 配置类
│   ├── DataInitializer.java       # 数据初始化
│   ├── RedisConfig.java           # Redis配置
│   └── SecurityConfig.java        # 安全配置
├── controller/                     # 控制器层
│   ├── SystemController.java      # 系统信息API
│   └── UserController.java        # 用户管理API
├── entity/                         # 实体类
│   └── User.java                  # 用户实体
├── repository/                     # 数据访问层
│   └── UserRepository.java       # 用户仓库
└── service/                       # 服务层
    └── UserService.java          # 用户服务

src/main/resources/
├── application.yml                # 应用配置文件
└── ...
```

## 📋 功能特性

### 🔧 核心功能
- ✅ **自动配置**: SpringBoot自动配置机制
- ✅ **起步依赖**: 简化的依赖管理
- ✅ **内嵌服务器**: 内置Tomcat服务器
- ✅ **生产就绪**: Actuator监控和健康检查

### 🌐 Web功能
- ✅ **RESTful API**: 完整的REST接口设计
- ✅ **JSON序列化**: 自动JSON请求/响应处理
- ✅ **跨域支持**: CORS配置
- ✅ **参数验证**: Bean Validation校验
- ✅ **统一响应**: ResponseResult统一返回格式

### 💾 数据访问
- ✅ **Spring Data JPA**: 简化的数据库访问
- ✅ **H2数据库**: 内存数据库，即开即用
- ✅ **事务管理**: 声明式事务处理
- ✅ **审计功能**: 自动记录创建/更新时间
- ✅ **查询方法**: 多种查询方式演示

### 🚀 缓存功能
- ✅ **Spring Cache**: 声明式缓存
- ✅ **Redis集成**: Redis作为缓存存储
- ✅ **缓存注解**: @Cacheable等注解使用
- ✅ **缓存管理**: 统一的缓存配置

### 🔐 安全功能
- ✅ **Spring Security**: 企业级安全框架
- ✅ **跨域配置**: CORS安全设置
- ✅ **CSRF防护**: 可配置的CSRF保护

### 📊 监控功能
- ✅ **Actuator**: 生产级应用监控
- ✅ **健康检查**: 应用健康状态监控
- ✅ **指标收集**: 运行时指标统计
- ✅ **配置查看**: 运行时配置信息

## 📚 API文档

### 用户管理 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取所有用户 |
| GET | `/api/users/{id}` | 根据ID获取用户 |
| POST | `/api/users` | 创建新用户 |
| PUT | `/api/users/{id}` | 更新用户信息 |
| DELETE | `/api/users/{id}` | 删除用户 |
| GET | `/api/users/page` | 分页获取用户 |
| GET | `/api/users/search` | 搜索用户 |
| GET | `/api/users/active` | 获取活跃用户 |
| GET | `/api/users/stats` | 获取用户统计 |

### 系统信息 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/system/info` | 获取应用信息 |
| GET | `/api/system/database` | 获取数据库配置 |
| GET | `/api/system/redis` | 获取Redis配置 |
| GET | `/api/system/health` | 健康检查 |
| GET | `/api/system/features` | SpringBoot功能特性 |

## 🔧 配置说明

### 数据库配置
项目默认使用H2内存数据库，无需额外安装。H2控制台可以通过以下方式访问：
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- 用户名: `sa`
- 密码: `password`

### Redis配置
如果需要使用Redis缓存功能，请确保Redis服务器在以下地址运行：
- 主机: `localhost`
- 端口: `6379`
- 数据库: `0`

### 示例数据
应用启动时会自动创建以下示例用户：
- 管理员: `admin` / `admin123`
- 普通用户: `john_doe` / `password123`
- 更多测试用户...

## 🧪 测试API

可以使用以下工具测试API：
- **Postman**: 导入API集合
- **curl**: 命令行测试
- **浏览器**: 直接访问GET接口

### 示例请求

```bash
# 获取所有用户
curl http://localhost:8080/api/users

# 获取系统信息
curl http://localhost:8080/api/system/info

# 创建新用户
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123"}'
```

## 🐛 常见问题

### Q: 应用启动失败
A: 检查Java版本是否为17+，确保8080端口未被占用

### Q: H2控制台无法访问
A: 确保使用正确的URL和数据库连接信息

### Q: Redis连接失败
A: Redis是可选的，如果没有Redis服务器，缓存功能会降级但不影响其他功能

## 📄 许可证

MIT License - 详情请参阅 LICENSE 文件 