const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const { createClient } = require('redis');

// 导入路由模块
const stringRoutes = require('./routes/stringRoutes');
const hashRoutes = require('./routes/hashRoutes');
const listRoutes = require('./routes/listRoutes');
const setRoutes = require('./routes/setRoutes');
const sortedSetRoutes = require('./routes/sortedSetRoutes');
const streamRoutes = require('./routes/streamRoutes');
const pubSubRoutes = require('./routes/pubSubRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const systemRoutes = require('./routes/systemRoutes');
const cacheRoutes = require('./routes/cacheRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

// 中间件配置
app.use(helmet()); // 安全头部
app.use(compression()); // 响应压缩
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
})); // 跨域支持
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Redis客户端配置
const redisClient = createClient({
  host: 'localhost',
  port: 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis服务器拒绝连接');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('重试时间已耗尽');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis连接处理
redisClient.on('connect', () => {
  console.log('✅ Redis客户端已连接');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis客户端已就绪');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis连接错误:', err);
});

redisClient.on('end', () => {
  console.log('🔌 Redis连接已断开');
});

// 连接到Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('📡 已连接到Redis服务器');
  } catch (error) {
    console.error('❌ Redis连接失败:', error.message);
    console.log('⚠️  应用将在没有Redis的情况下运行（功能受限）');
  }
})();

// 将Redis客户端添加到请求对象中
app.use((req, res, next) => {
  req.redis = redisClient;
  next();
});

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Redis后端演示API',
    version: '1.0.0',
    description: '展示Redis所有核心功能的完整后端服务',
    endpoints: {
      strings: '/api/strings - 字符串操作',
      hashes: '/api/hashes - 哈希表操作',
      lists: '/api/lists - 列表操作',
      sets: '/api/sets - 集合操作',
      sortedSets: '/api/sorted-sets - 有序集合操作',
      streams: '/api/streams - 流操作',
      pubsub: '/api/pubsub - 发布订阅',
      transactions: '/api/transactions - 事务操作',
      pipelines: '/api/pipelines - 管道操作',
      scripts: '/api/scripts - Lua脚本',
      system: '/api/system - 系统信息',
      cache: '/api/cache - 缓存管理',
      sessions: '/api/sessions - 会话管理',
      analytics: '/api/analytics - 数据分析'
    },
    documentation: 'https://redis.io/documentation',
    status: 'running'
  });
});

// API路由注册
app.use('/api/strings', stringRoutes);
app.use('/api/hashes', hashRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/sorted-sets', sortedSetRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/pubsub', pubSubRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const ping = await redisClient.ping();
    res.json({
      status: 'healthy',
      redis: ping === 'PONG' ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('🚨 服务器错误:', error);
  res.status(500).json({
    error: '内部服务器错误',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '未找到请求的资源',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 Redis后端演示服务器已启动
📍 服务地址: http://localhost:${PORT}
📚 API文档: http://localhost:${PORT}
🏥 健康检查: http://localhost:${PORT}/health
⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}
  `);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔄 正在关闭服务器...');
  try {
    await redisClient.quit();
    console.log('✅ Redis连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 关闭过程中出错:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🔄 收到终止信号，正在关闭服务器...');
  try {
    await redisClient.quit();
    console.log('✅ Redis连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 关闭过程中出错:', error);
    process.exit(1);
  }
});

module.exports = app; 