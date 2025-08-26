const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 会话管理路由 - Redis会话存储

const JWT_SECRET = 'redis_session_demo_secret';
const SESSION_TTL = 3600; // 1小时

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['username', 'password']
      });
    }

    // 模拟用户数据库查询
    const users = {
      'admin': { id: 1, username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin' },
      'user1': { id: 2, username: 'user1', password: await bcrypt.hash('password123', 10), role: 'user' },
      'demo': { id: 3, username: 'demo', password: await bcrypt.hash('demo123', 10), role: 'user' }
    };

    const user = users[username];
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        error: '用户名或密码错误'
      });
    }

    // 生成会话ID和JWT令牌
    const sessionId = uuidv4();
    const token = jwt.sign(
      { userId: user.id, username: user.username, sessionId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 存储会话信息到Redis
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      isActive: true
    };

    await req.redis.setEx(`session:${sessionId}`, SESSION_TTL, JSON.stringify(sessionData));

    res.json({
      success: true,
      message: '登录成功',
      sessionId,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      expiresIn: SESSION_TTL
    });
  } catch (error) {
    res.status(500).json({
      error: '登录失败',
      message: error.message
    });
  }
});

// 验证会话
router.post('/verify', async (req, res) => {
  try {
    const { token, sessionId } = req.body;
    
    if (!token || !sessionId) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['token', 'sessionId']
      });
    }

    // 验证JWT令牌
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Token无效或已过期',
        details: jwtError.message
      });
    }

    // 检查会话是否存在
    const sessionData = await req.redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(401).json({
        error: '会话不存在或已过期'
      });
    }

    const session = JSON.parse(sessionData);
    
    // 验证会话ID匹配
    if (decoded.sessionId !== sessionId) {
      return res.status(401).json({
        error: '会话ID不匹配'
      });
    }

    // 更新最后活动时间并续期
    session.lastActivity = new Date().toISOString();
    await req.redis.setEx(`session:${sessionId}`, SESSION_TTL, JSON.stringify(session));

    res.json({
      success: true,
      message: '会话验证成功',
      session: {
        ...session,
        sessionId,
        remainingTTL: await req.redis.ttl(`session:${sessionId}`)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '会话验证失败',
      message: error.message
    });
  }
});

// 用户登出
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['sessionId']
      });
    }

    // 删除会话
    const deleted = await req.redis.del(`session:${sessionId}`);

    res.json({
      success: true,
      message: deleted > 0 ? '登出成功' : '会话不存在',
      sessionId,
      deleted: deleted > 0
    });
  } catch (error) {
    res.status(500).json({
      error: '登出失败',
      message: error.message
    });
  }
});

// 获取活跃会话列表
router.get('/active', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let cursor = 0;
    const sessions = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'session:*',
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        const sessionData = await req.redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const sessionId = key.replace('session:', '');
          
          // 如果指定了userId，只返回该用户的会话
          if (!userId || session.userId.toString() === userId.toString()) {
            sessions.push({
              sessionId,
              ...session,
              ttl: await req.redis.ttl(key)
            });
          }
        }
      }
    } while (cursor !== 0);

    // 按最后活动时间排序
    sessions.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.json({
      success: true,
      message: '获取活跃会话成功',
      sessions,
      count: sessions.length,
      filteredByUser: !!userId
    });
  } catch (error) {
    res.status(500).json({
      error: '获取活跃会话失败',
      message: error.message
    });
  }
});

// 强制下线会话
router.delete('/terminate/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason = 'admin_action' } = req.body;
    
    // 获取会话信息
    const sessionData = await req.redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return res.status(404).json({
        error: '会话不存在'
      });
    }

    const session = JSON.parse(sessionData);
    
    // 记录下线日志
    const logEntry = {
      sessionId,
      userId: session.userId,
      username: session.username,
      terminatedAt: new Date().toISOString(),
      reason,
      originalLoginTime: session.loginTime
    };
    
    await req.redis.lPush('session:terminated_log', JSON.stringify(logEntry));
    
    // 删除会话
    const deleted = await req.redis.del(`session:${sessionId}`);

    res.json({
      success: true,
      message: '会话已强制下线',
      sessionId,
      terminatedSession: session,
      reason,
      deleted: deleted > 0
    });
  } catch (error) {
    res.status(500).json({
      error: '强制下线失败',
      message: error.message
    });
  }
});

// 会话统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      activeSessions: 0,
      userSessions: {},
      roleSessions: {},
      recentLogins: [],
      sessionsByHour: {}
    };

    let cursor = 0;
    const allSessions = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'session:*',
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        const sessionData = await req.redis.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const sessionId = key.replace('session:', '');
          allSessions.push({ sessionId, ...session });
        }
      }
    } while (cursor !== 0);

    stats.activeSessions = allSessions.length;

    // 统计用户会话数
    allSessions.forEach(session => {
      stats.userSessions[session.username] = (stats.userSessions[session.username] || 0) + 1;
      stats.roleSessions[session.role] = (stats.roleSessions[session.role] || 0) + 1;
      
      // 统计每小时登录数
      const loginHour = new Date(session.loginTime).getHours();
      stats.sessionsByHour[loginHour] = (stats.sessionsByHour[loginHour] || 0) + 1;
    });

    // 最近登录（按登录时间排序）
    stats.recentLogins = allSessions
      .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))
      .slice(0, 10)
      .map(session => ({
        username: session.username,
        role: session.role,
        loginTime: session.loginTime,
        ipAddress: session.ipAddress
      }));

    res.json({
      success: true,
      message: '会话统计信息',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '获取会话统计失败',
      message: error.message
    });
  }
});

// 清理过期会话
router.post('/cleanup', async (req, res) => {
  try {
    let cursor = 0;
    const expiredSessions = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'session:*',
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        const ttl = await req.redis.ttl(key);
        if (ttl === -2) { // 已过期
          expiredSessions.push(key);
        }
      }
    } while (cursor !== 0);

    // 删除过期会话
    let deletedCount = 0;
    if (expiredSessions.length > 0) {
      deletedCount = await req.redis.del(expiredSessions);
    }

    res.json({
      success: true,
      message: '会话清理完成',
      expiredSessions: expiredSessions.length,
      deletedSessions: deletedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '会话清理失败',
      message: error.message
    });
  }
});

// 获取会话演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建演示会话数据
    const demoSessions = [
      {
        username: 'admin',
        role: 'admin',
        loginTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        username: 'user1',
        role: 'user',
        loginTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分钟前
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        username: 'demo',
        role: 'user',
        loginTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分钟前
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      }
    ];

    // 创建演示会话
    const createdSessions = [];
    for (let i = 0; i < demoSessions.length; i++) {
      const sessionId = `demo_${Date.now()}_${i}`;
      const sessionData = {
        userId: i + 100,
        ...demoSessions[i],
        lastActivity: new Date().toISOString(),
        isActive: true
      };
      
      await req.redis.setEx(`session:${sessionId}`, SESSION_TTL, JSON.stringify(sessionData));
      createdSessions.push({ sessionId, ...sessionData });
    }

    res.json({
      success: true,
      message: '会话演示数据',
      data: {
        demoSessions: createdSessions,
        features: [
          '基于Redis的分布式会话存储',
          'JWT令牌与会话双重验证',
          '会话自动过期和续期',
          '多设备登录管理',
          '会话统计和监控',
          '强制下线功能'
        ],
        useCases: [
          '用户登录状态管理',
          '单点登录(SSO)系统',
          '多服务器会话共享',
          '用户权限控制',
          '安全审计和监控',
          '防止会话劫持'
        ],
        endpoints: [
          'POST /api/sessions/login - 用户登录',
          'POST /api/sessions/verify - 验证会话',
          'POST /api/sessions/logout - 用户登出',
          'GET /api/sessions/active - 获取活跃会话',
          'DELETE /api/sessions/terminate/:id - 强制下线',
          'GET /api/sessions/stats - 会话统计'
        ]
      },
      testCredentials: [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'user1', password: 'password123', role: 'user' },
        { username: 'demo', password: 'demo123', role: 'user' }
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建会话演示数据失败',
      message: error.message
    });
  }
});

// 获取终止会话日志
router.get('/terminated-log', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const logs = await req.redis.lRange('session:terminated_log', 0, parseInt(limit) - 1);
    const parsedLogs = logs.map(log => JSON.parse(log));

    res.json({
      success: true,
      message: '终止会话日志',
      logs: parsedLogs,
      count: parsedLogs.length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取终止会话日志失败',
      message: error.message
    });
  }
});

// 批量会话操作
router.post('/batch', async (req, res) => {
  try {
    const { action, sessionIds, reason } = req.body;
    
    if (!action || !sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        error: '参数格式错误',
        required: ['action', 'sessionIds (array)']
      });
    }

    const results = [];
    
    switch (action) {
      case 'terminate':
        for (const sessionId of sessionIds) {
          try {
            const sessionData = await req.redis.get(`session:${sessionId}`);
            if (sessionData) {
              const session = JSON.parse(sessionData);
              
              // 记录日志
              const logEntry = {
                sessionId,
                userId: session.userId,
                username: session.username,
                terminatedAt: new Date().toISOString(),
                reason: reason || 'batch_action'
              };
              
              await req.redis.lPush('session:terminated_log', JSON.stringify(logEntry));
              await req.redis.del(`session:${sessionId}`);
              
              results.push({ sessionId, success: true, action: 'terminated' });
            } else {
              results.push({ sessionId, success: false, error: 'session_not_found' });
            }
          } catch (error) {
            results.push({ sessionId, success: false, error: error.message });
          }
        }
        break;

      case 'extend':
        const extendTTL = 3600; // 延长1小时
        for (const sessionId of sessionIds) {
          try {
            const exists = await req.redis.exists(`session:${sessionId}`);
            if (exists) {
              await req.redis.expire(`session:${sessionId}`, extendTTL);
              results.push({ sessionId, success: true, action: 'extended', newTTL: extendTTL });
            } else {
              results.push({ sessionId, success: false, error: 'session_not_found' });
            }
          } catch (error) {
            results.push({ sessionId, success: false, error: error.message });
          }
        }
        break;

      default:
        return res.status(400).json({
          error: '不支持的操作',
          supportedActions: ['terminate', 'extend']
        });
    }

    res.json({
      success: true,
      message: '批量会话操作完成',
      action,
      processed: sessionIds.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      error: '批量会话操作失败',
      message: error.message
    });
  }
});

module.exports = router; 