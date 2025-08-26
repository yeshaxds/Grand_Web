# Redis 后端演示项目

## 📖 项目简介

这是一个完整的Redis后端演示项目，全面展示了Redis作为数据库和缓存的强大功能。项目包含了Redis的所有核心数据类型、高级功能以及实际应用场景的完整实现。

## 🚀 快速开始

### 前置要求
- Node.js 16.0 或更高版本
- Redis 服务器 (推荐 6.0+)
- npm 或 yarn 包管理器

### 安装和启动

#### Windows系统
```bash
# 直接运行启动脚本
start.bat

# 或者手动启动
npm install
npm start
```

#### Linux/Mac系统
```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 或者开发模式
npm run dev
```

### 访问地址
- **API服务器**: http://localhost:8081
- **健康检查**: http://localhost:8081/health
- **API文档**: http://localhost:8081 (根路径)

## 🏗️ 项目结构

```
redis/
├── server.js                    # 主服务器文件
├── package.json                 # 项目配置和依赖
├── start.bat                    # Windows启动脚本
├── README.md                    # 项目说明文档
└── routes/                      # API路由目录
    ├── stringRoutes.js          # 字符串操作
    ├── hashRoutes.js            # 哈希表操作
    ├── listRoutes.js            # 列表操作
    ├── setRoutes.js             # 集合操作
    ├── sortedSetRoutes.js       # 有序集合操作
    ├── streamRoutes.js          # 流操作
    ├── pubSubRoutes.js          # 发布订阅
    ├── transactionRoutes.js     # 事务操作
    ├── pipelineRoutes.js        # 管道操作
    ├── scriptRoutes.js          # Lua脚本
    ├── systemRoutes.js          # 系统信息
    ├── cacheRoutes.js           # 缓存管理
    ├── sessionRoutes.js         # 会话管理
    └── analyticsRoutes.js       # 数据分析
```

## 📋 Redis功能展示

### 🔧 核心数据类型
- ✅ **String (字符串)** - 基础键值存储
- ✅ **Hash (哈希表)** - 对象存储
- ✅ **List (列表)** - 有序集合，支持队列和栈
- ✅ **Set (集合)** - 无序唯一集合
- ✅ **Sorted Set (有序集合)** - 带分数的排序集合
- ✅ **Stream (流)** - 消息流和事件日志

### 🚀 高级功能
- ✅ **Pub/Sub (发布订阅)** - 实时消息传递
- ✅ **Transactions (事务)** - 原子性操作
- ✅ **Pipeline (管道)** - 批量操作优化
- ✅ **Lua Scripts (脚本)** - 服务器端脚本执行
- ✅ **TTL/Expire (过期)** - 自动数据过期

### 💼 实际应用场景
- ✅ **缓存系统** - 数据缓存和会话存储
- ✅ **会话管理** - 分布式会话存储
- ✅ **实时分析** - 用户行为分析和统计
- ✅ **消息队列** - 任务队列和消息传递
- ✅ **排行榜** - 实时排名系统
- ✅ **限流器** - API限流和防刷

## 📚 API接口文档

### 字符串操作 (Strings)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/strings/set` | 设置字符串值 |
| GET | `/api/strings/get/:key` | 获取字符串值 |
| POST | `/api/strings/mset` | 批量设置 |
| POST | `/api/strings/mget` | 批量获取 |
| POST | `/api/strings/incr/:key` | 数值递增 |
| GET | `/api/strings/demo` | 演示数据 |

### 哈希表操作 (Hashes)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/hashes/hset` | 设置哈希字段 |
| GET | `/api/hashes/hget/:key/:field` | 获取哈希字段 |
| GET | `/api/hashes/hgetall/:key` | 获取所有字段 |
| POST | `/api/hashes/hmset` | 批量设置字段 |
| DELETE | `/api/hashes/hdel/:key` | 删除字段 |
| GET | `/api/hashes/demo` | 演示数据 |

### 列表操作 (Lists)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/lists/lpush` | 左侧推入 |
| POST | `/api/lists/rpush` | 右侧推入 |
| POST | `/api/lists/lpop/:key` | 左侧弹出 |
| POST | `/api/lists/rpop/:key` | 右侧弹出 |
| GET | `/api/lists/lrange/:key` | 获取范围元素 |
| GET | `/api/lists/demo` | 演示数据 |

### 集合操作 (Sets)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/sets/sadd` | 添加成员 |
| GET | `/api/sets/smembers/:key` | 获取所有成员 |
| POST | `/api/sets/sinter` | 集合交集 |
| POST | `/api/sets/sunion` | 集合并集 |
| POST | `/api/sets/sdiff` | 集合差集 |
| GET | `/api/sets/demo` | 演示数据 |

### 有序集合操作 (Sorted Sets)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/sorted-sets/zadd` | 添加成员和分数 |
| GET | `/api/sorted-sets/zrange/:key` | 按排名获取 |
| GET | `/api/sorted-sets/zrangebyscore/:key` | 按分数获取 |
| GET | `/api/sorted-sets/zscore/:key/:member` | 获取分数 |
| GET | `/api/sorted-sets/zrank/:key/:member` | 获取排名 |
| GET | `/api/sorted-sets/demo` | 演示数据 |

### 流操作 (Streams)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/streams/xadd` | 添加消息 |
| GET | `/api/streams/xrange/:key` | 读取消息 |
| POST | `/api/streams/xgroup-create` | 创建消费者组 |
| POST | `/api/streams/xreadgroup` | 从组读取 |
| GET | `/api/streams/demo` | 演示数据 |

### 发布订阅 (Pub/Sub)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/pubsub/publish` | 发布消息 |
| GET | `/api/pubsub/channels` | 获取频道 |
| POST | `/api/pubsub/demo-publish` | 演示发布 |
| GET | `/api/pubsub/realtime/:channel` | 实时订阅 |
| GET | `/api/pubsub/demo` | 演示数据 |

### 事务操作 (Transactions)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/transactions/exec` | 执行事务 |
| POST | `/api/transactions/demo-transfer` | 银行转账演示 |
| POST | `/api/transactions/demo-inventory` | 库存扣减演示 |
| POST | `/api/transactions/demo-counters` | 计数器演示 |
| GET | `/api/transactions/demo` | 演示数据 |

### 管道操作 (Pipelines)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/pipelines/exec` | 执行管道 |
| POST | `/api/pipelines/demo-batch-operations` | 批量操作 |
| POST | `/api/pipelines/demo-performance` | 性能对比 |
| POST | `/api/pipelines/demo-migration` | 数据迁移 |
| GET | `/api/pipelines/demo` | 演示数据 |

### Lua脚本 (Scripts)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/scripts/eval` | 执行脚本 |
| POST | `/api/scripts/atomic-counter` | 原子计数器 |
| POST | `/api/scripts/rate-limiter` | 限流器 |
| POST | `/api/scripts/distributed-lock` | 分布式锁 |
| POST | `/api/scripts/atomic-inventory` | 原子库存 |
| GET | `/api/scripts/demo` | 演示数据 |

### 系统信息 (System)
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/system/info` | 服务器信息 |
| GET | `/api/system/config` | 配置信息 |
| GET | `/api/system/memory` | 内存使用 |
| GET | `/api/system/clients` | 客户端连接 |
| GET | `/api/system/overview` | 系统概览 |
| GET | `/api/system/ping` | 连接测试 |

### 缓存管理 (Cache)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/cache/set` | 设置缓存 |
| GET | `/api/cache/get/:key` | 获取缓存 |
| GET | `/api/cache/user/:userId` | 用户缓存 |
| GET | `/api/cache/trending` | 热点数据 |
| POST | `/api/cache/session` | 会话缓存 |
| GET | `/api/cache/stats` | 缓存统计 |

### 会话管理 (Sessions)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/sessions/login` | 用户登录 |
| POST | `/api/sessions/verify` | 验证会话 |
| POST | `/api/sessions/logout` | 用户登出 |
| GET | `/api/sessions/active` | 活跃会话 |
| DELETE | `/api/sessions/terminate/:id` | 强制下线 |
| GET | `/api/sessions/stats` | 会话统计 |

### 数据分析 (Analytics)
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/analytics/track` | 记录事件 |
| GET | `/api/analytics/realtime` | 实时统计 |
| GET | `/api/analytics/user/:userId` | 用户分析 |
| POST | `/api/analytics/funnel` | 漏斗分析 |
| GET | `/api/analytics/retention` | 留存分析 |
| POST | `/api/analytics/ab-test` | A/B测试 |

## 🧪 测试示例

### 基础字符串操作
```bash
# 设置字符串
curl -X POST http://localhost:8081/api/strings/set \
  -H "Content-Type: application/json" \
  -d '{"key":"test_key","value":"Hello Redis!","ttl":3600}'

# 获取字符串
curl http://localhost:8081/api/strings/get/test_key
```

### 用户会话管理
```bash
# 用户登录
curl -X POST http://localhost:8081/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 验证会话
curl -X POST http://localhost:8081/api/sessions/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"your_jwt_token","sessionId":"your_session_id"}'
```

### 事件跟踪分析
```bash
# 记录用户事件
curl -X POST http://localhost:8081/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"event":"page_view","userId":"user123","data":{"page":"/home"}}'

# 获取实时统计
curl http://localhost:8081/api/analytics/realtime
```

## 🎯 应用场景演示

### 1. 电商系统
- **商品缓存**: 热门商品信息缓存
- **购物车**: 用户购物车数据存储
- **库存管理**: 原子性库存扣减
- **订单处理**: 事务保证数据一致性

### 2. 社交媒体
- **用户会话**: 分布式会话管理
- **消息系统**: 实时消息推送
- **排行榜**: 实时热门内容排名
- **用户分析**: 行为数据分析

### 3. 游戏系统
- **排行榜**: 玩家分数排名
- **成就系统**: 玩家成就存储
- **实时对战**: 游戏状态同步
- **数据分析**: 游戏行为统计

### 4. 企业应用
- **API限流**: 接口访问频率控制
- **分布式锁**: 资源访问控制
- **任务队列**: 异步任务处理
- **监控告警**: 系统状态监控

## 🔧 配置说明

### Redis连接配置
```javascript
// server.js 中的配置
const redisClient = createClient({
  host: 'localhost',
  port: 6379,
  // 可以添加密码、数据库等配置
});
```

### 环境变量
```bash
PORT=8081                    # 服务器端口
REDIS_HOST=localhost         # Redis主机
REDIS_PORT=6379             # Redis端口
REDIS_PASSWORD=             # Redis密码（可选）
```

## 🐛 常见问题

### Q: Redis连接失败
A: 确保Redis服务器正在运行，检查连接配置

### Q: 某些功能不工作
A: 检查Redis版本，某些功能需要较新版本

### Q: 性能问题
A: 考虑使用管道操作，减少网络往返

### Q: 数据持久化
A: 配置Redis的RDB或AOF持久化

## 📈 性能优化

### 1. 使用管道操作
```javascript
// 批量操作使用管道
const pipeline = redis.multi();
for (let i = 0; i < 1000; i++) {
  pipeline.set(`key:${i}`, `value:${i}`);
}
await pipeline.exec();
```

### 2. 合理设置过期时间
```javascript
// 设置合适的TTL
await redis.setEx('cache:key', 3600, 'value'); // 1小时过期
```

### 3. 使用Lua脚本
```javascript
// 原子性操作使用Lua脚本
const script = `
  local current = redis.call('GET', KEYS[1])
  if tonumber(current) < tonumber(ARGV[1]) then
    return redis.call('INCR', KEYS[1])
  else
    return current
  end
`;
```

## 🔒 安全建议

1. **网络安全**: 使用防火墙限制Redis访问
2. **认证**: 设置Redis密码认证
3. **权限控制**: 使用ACL控制用户权限
4. **数据加密**: 敏感数据加密存储
5. **监控**: 监控异常访问和操作

## 📄 许可证

MIT License - 详情请参阅 LICENSE 文件

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

---

**享受Redis的强大功能！** 🎉 