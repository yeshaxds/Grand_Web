const express = require('express');
const router = express.Router();

// 缓存管理路由 - Redis缓存应用场景

// 设置缓存
router.post('/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'value']
      });
    }

    let result;
    if (ttl) {
      result = await req.redis.setEx(key, ttl, JSON.stringify(value));
    } else {
      result = await req.redis.set(key, JSON.stringify(value));
    }

    res.json({
      success: true,
      message: '缓存设置成功',
      key,
      value,
      ttl: ttl || null,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: '设置缓存失败',
      message: error.message
    });
  }
});

// 获取缓存
router.get('/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await req.redis.get(key);
    const ttl = await req.redis.ttl(key);
    
    if (value === null) {
      return res.status(404).json({
        error: '缓存不存在',
        key
      });
    }

    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    res.json({
      success: true,
      key,
      value: parsedValue,
      ttl: ttl === -1 ? 'persistent' : ttl === -2 ? 'expired' : ttl,
      cached: true
    });
  } catch (error) {
    res.status(500).json({
      error: '获取缓存失败',
      message: error.message
    });
  }
});

// 用户信息缓存演示
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `cache:user:${userId}`;
    
    // 尝试从缓存获取
    const cachedUser = await req.redis.get(cacheKey);
    
    if (cachedUser) {
      return res.json({
        success: true,
        message: '从缓存获取用户信息',
        user: JSON.parse(cachedUser),
        cached: true,
        ttl: await req.redis.ttl(cacheKey)
      });
    }

    // 模拟从数据库获取用户信息
    const userData = {
      id: userId,
      username: `user_${userId}`,
      email: `user${userId}@example.com`,
      profile: {
        name: `User ${userId}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        bio: `This is user ${userId}'s bio`,
        location: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)],
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      preferences: {
        theme: Math.random() > 0.5 ? 'dark' : 'light',
        language: Math.random() > 0.5 ? 'zh-CN' : 'en-US',
        notifications: Math.random() > 0.5
      },
      stats: {
        posts: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500)
      }
    };

    // 缓存用户信息，TTL 5分钟
    await req.redis.setEx(cacheKey, 300, JSON.stringify(userData));

    res.json({
      success: true,
      message: '从数据库获取用户信息并缓存',
      user: userData,
      cached: false,
      ttl: 300
    });
  } catch (error) {
    res.status(500).json({
      error: '获取用户信息失败',
      message: error.message
    });
  }
});

// 热点数据缓存演示
router.get('/trending', async (req, res) => {
  try {
    const cacheKey = 'cache:trending:posts';
    
    // 尝试从缓存获取
    const cachedTrending = await req.redis.get(cacheKey);
    
    if (cachedTrending) {
      return res.json({
        success: true,
        message: '从缓存获取热点数据',
        data: JSON.parse(cachedTrending),
        cached: true,
        ttl: await req.redis.ttl(cacheKey)
      });
    }

    // 模拟计算热点数据（耗时操作）
    const trendingPosts = [];
    for (let i = 1; i <= 10; i++) {
      trendingPosts.push({
        id: i,
        title: `热门文章 ${i}`,
        content: `这是第 ${i} 篇热门文章的内容摘要...`,
        author: `作者${i}`,
        views: Math.floor(Math.random() * 10000) + 1000,
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 500) + 50,
        publishTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['技术', '生活', '娱乐', '科技', '教育'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    const trendingData = {
      posts: trendingPosts,
      lastUpdated: new Date().toISOString(),
      totalViews: trendingPosts.reduce((sum, post) => sum + post.views, 0)
    };

    // 缓存热点数据，TTL 10分钟
    await req.redis.setEx(cacheKey, 600, JSON.stringify(trendingData));

    res.json({
      success: true,
      message: '计算热点数据并缓存',
      data: trendingData,
      cached: false,
      ttl: 600
    });
  } catch (error) {
    res.status(500).json({
      error: '获取热点数据失败',
      message: error.message
    });
  }
});

// 会话缓存演示
router.post('/session', async (req, res) => {
  try {
    const { action, sessionId, data } = req.body;
    
    if (!action || !sessionId) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['action', 'sessionId']
      });
    }

    const sessionKey = `cache:session:${sessionId}`;

    switch (action) {
      case 'create':
        if (!data) {
          return res.status(400).json({
            error: '创建会话需要提供数据',
            required: ['data']
          });
        }

        const sessionData = {
          ...data,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 1
        };

        await req.redis.setEx(sessionKey, 3600, JSON.stringify(sessionData)); // 1小时过期

        res.json({
          success: true,
          message: '会话创建成功',
          sessionId,
          data: sessionData,
          ttl: 3600
        });
        break;

      case 'get':
        const session = await req.redis.get(sessionKey);
        
        if (!session) {
          return res.status(404).json({
            error: '会话不存在或已过期',
            sessionId
          });
        }

        const sessionInfo = JSON.parse(session);
        sessionInfo.lastAccessed = new Date().toISOString();
        sessionInfo.accessCount = (sessionInfo.accessCount || 0) + 1;

        // 更新会话信息并续期
        await req.redis.setEx(sessionKey, 3600, JSON.stringify(sessionInfo));

        res.json({
          success: true,
          message: '获取会话成功',
          sessionId,
          data: sessionInfo,
          ttl: await req.redis.ttl(sessionKey)
        });
        break;

      case 'destroy':
        const deleted = await req.redis.del(sessionKey);
        
        res.json({
          success: deleted > 0,
          message: deleted > 0 ? '会话销毁成功' : '会话不存在',
          sessionId,
          deleted: deleted > 0
        });
        break;

      default:
        return res.status(400).json({
          error: '无效的操作',
          validActions: ['create', 'get', 'destroy']
        });
    }
  } catch (error) {
    res.status(500).json({
      error: '会话操作失败',
      message: error.message
    });
  }
});

// 缓存穿透防护演示
router.get('/protected/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const cacheKey = `cache:protected:${key}`;
    const nullCacheKey = `cache:null:${key}`;
    
    // 检查是否有空值缓存（防止缓存穿透）
    const nullCache = await req.redis.get(nullCacheKey);
    if (nullCache) {
      return res.json({
        success: true,
        message: '数据不存在（来自空值缓存）',
        key,
        data: null,
        cached: true,
        protection: 'null_cache'
      });
    }

    // 检查正常缓存
    const cachedData = await req.redis.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        message: '从缓存获取数据',
        key,
        data: JSON.parse(cachedData),
        cached: true,
        protection: 'normal_cache'
      });
    }

    // 模拟数据库查询
    let data = null;
    if (Math.random() > 0.3) { // 70%概率有数据
      data = {
        id: key,
        content: `Protected data for key: ${key}`,
        timestamp: new Date().toISOString(),
        type: 'protected'
      };
      
      // 缓存真实数据
      await req.redis.setEx(cacheKey, 300, JSON.stringify(data));
    } else {
      // 缓存空值，防止缓存穿透
      await req.redis.setEx(nullCacheKey, 60, 'null'); // 空值缓存时间较短
    }

    res.json({
      success: true,
      message: data ? '从数据库获取数据并缓存' : '数据不存在，设置空值缓存',
      key,
      data,
      cached: false,
      protection: data ? 'normal_cache' : 'null_cache'
    });
  } catch (error) {
    res.status(500).json({
      error: '获取受保护数据失败',
      message: error.message
    });
  }
});

// 缓存预热演示
router.post('/preload', async (req, res) => {
  try {
    const { type = 'users', count = 10 } = req.body;
    
    const preloadedKeys = [];
    const pipeline = req.redis.multi();

    switch (type) {
      case 'users':
        for (let i = 1; i <= count; i++) {
          const userData = {
            id: i,
            username: `preload_user_${i}`,
            email: `user${i}@preload.com`,
            lastLogin: new Date().toISOString()
          };
          const key = `cache:preload:user:${i}`;
          pipeline.setEx(key, 1800, JSON.stringify(userData)); // 30分钟
          preloadedKeys.push(key);
        }
        break;

      case 'products':
        for (let i = 1; i <= count; i++) {
          const productData = {
            id: i,
            name: `Product ${i}`,
            price: Math.floor(Math.random() * 1000) + 100,
            category: ['Electronics', 'Books', 'Clothing', 'Home'][Math.floor(Math.random() * 4)],
            inStock: Math.random() > 0.2
          };
          const key = `cache:preload:product:${i}`;
          pipeline.setEx(key, 3600, JSON.stringify(productData)); // 1小时
          preloadedKeys.push(key);
        }
        break;

      default:
        return res.status(400).json({
          error: '不支持的预热类型',
          supportedTypes: ['users', 'products']
        });
    }

    await pipeline.exec();

    res.json({
      success: true,
      message: '缓存预热完成',
      type,
      count,
      preloadedKeys,
      executionTime: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      error: '缓存预热失败',
      message: error.message
    });
  }
});

// 获取缓存演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建演示缓存数据
    const demoData = {
      userCache: {
        description: '用户信息缓存',
        endpoint: 'GET /api/cache/user/:userId',
        ttl: '5分钟',
        benefits: ['减少数据库查询', '提高响应速度', '降低系统负载']
      },
      sessionCache: {
        description: '会话数据缓存',
        endpoint: 'POST /api/cache/session',
        ttl: '1小时',
        benefits: ['快速会话验证', '用户状态管理', '分布式会话']
      },
      hotDataCache: {
        description: '热点数据缓存',
        endpoint: 'GET /api/cache/trending',
        ttl: '10分钟',
        benefits: ['热点数据快速访问', '减少计算开销', '提升用户体验']
      },
      protectionCache: {
        description: '缓存穿透防护',
        endpoint: 'GET /api/cache/protected/:key',
        features: ['空值缓存', '防止恶意查询', '保护数据库']
      }
    };

    // 获取当前缓存统计
    const cacheStats = {
      totalKeys: 0,
      userCacheKeys: 0,
      sessionKeys: 0,
      protectedKeys: 0
    };

    // 统计不同类型的缓存键
    let cursor = 0;
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'cache:*',
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        cacheStats.totalKeys++;
        if (key.startsWith('cache:user:')) cacheStats.userCacheKeys++;
        if (key.startsWith('cache:session:')) cacheStats.sessionKeys++;
        if (key.startsWith('cache:protected:')) cacheStats.protectedKeys++;
      }
    } while (cursor !== 0);

    res.json({
      success: true,
      message: '缓存演示数据',
      data: demoData,
      statistics: cacheStats,
      scenarios: [
        {
          name: '数据库查询缓存',
          description: '缓存频繁查询的数据库结果',
          example: '用户信息、商品详情、文章内容'
        },
        {
          name: '计算结果缓存',
          description: '缓存复杂计算的结果',
          example: '统计数据、排行榜、推荐列表'
        },
        {
          name: '会话状态缓存',
          description: '存储用户会话和状态信息',
          example: '登录状态、购物车、用户偏好'
        },
        {
          name: '页面片段缓存',
          description: '缓存页面的部分内容',
          example: '导航菜单、侧边栏、页脚'
        }
      ],
      strategies: [
        {
          name: 'Cache-Aside',
          description: '应用程序管理缓存',
          flow: '查询缓存 -> 缓存未命中 -> 查询数据库 -> 更新缓存'
        },
        {
          name: 'Write-Through',
          description: '写入时同步更新缓存',
          flow: '写入数据库 -> 同步写入缓存'
        },
        {
          name: 'Write-Behind',
          description: '异步写入数据库',
          flow: '写入缓存 -> 异步写入数据库'
        }
      ],
      bestPractices: [
        '设置合适的过期时间',
        '使用有意义的键名规范',
        '实施缓存预热策略',
        '监控缓存命中率',
        '处理缓存穿透和雪崩',
        '定期清理过期数据'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '获取缓存演示数据失败',
      message: error.message
    });
  }
});

// 缓存统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      keys: {
        total: 0,
        byType: {},
        byTTL: {
          persistent: 0,
          expiring: 0,
          expired: 0
        }
      },
      memory: {
        used: 0,
        peak: 0
      }
    };

    // 获取所有缓存键
    let cursor = 0;
    const allKeys = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'cache:*',
        COUNT: 100
      });
      cursor = result.cursor;
      allKeys.push(...result.keys);
    } while (cursor !== 0);

    stats.keys.total = allKeys.length;

    // 分析键类型和TTL
    for (const key of allKeys) {
      const keyParts = key.split(':');
      const type = keyParts[1] || 'unknown';
      
      stats.keys.byType[type] = (stats.keys.byType[type] || 0) + 1;
      
      const ttl = await req.redis.ttl(key);
      if (ttl === -1) {
        stats.keys.byTTL.persistent++;
      } else if (ttl > 0) {
        stats.keys.byTTL.expiring++;
      } else {
        stats.keys.byTTL.expired++;
      }
    }

    // 获取内存信息
    try {
      const memoryInfo = await req.redis.info('memory');
      const memoryLines = memoryInfo.split('\r\n');
      
      for (const line of memoryLines) {
        if (line.startsWith('used_memory:')) {
          stats.memory.used = parseInt(line.split(':')[1]);
        } else if (line.startsWith('used_memory_peak:')) {
          stats.memory.peak = parseInt(line.split(':')[1]);
        }
      }
    } catch (error) {
      console.warn('无法获取内存信息:', error.message);
    }

    res.json({
      success: true,
      message: '缓存统计信息',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '获取缓存统计失败',
      message: error.message
    });
  }
});

// 清理过期缓存
router.delete('/cleanup', async (req, res) => {
  try {
    const { pattern = 'cache:*', dryRun = false } = req.query;
    
    let cursor = 0;
    const keysToDelete = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        const ttl = await req.redis.ttl(key);
        if (ttl === -2) { // 已过期但未被删除的键
          keysToDelete.push(key);
        }
      }
    } while (cursor !== 0);

    let deletedCount = 0;
    if (!dryRun && keysToDelete.length > 0) {
      deletedCount = await req.redis.del(keysToDelete);
    }

    res.json({
      success: true,
      message: dryRun ? '清理预览完成' : '清理完成',
      pattern,
      foundExpiredKeys: keysToDelete.length,
      deletedKeys: deletedCount,
      dryRun: dryRun === 'true',
      expiredKeys: dryRun === 'true' ? keysToDelete.slice(0, 10) : undefined
    });
  } catch (error) {
    res.status(500).json({
      error: '清理缓存失败',
      message: error.message
    });
  }
});

module.exports = router; 