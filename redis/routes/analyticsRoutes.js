const express = require('express');
const router = express.Router();

// 数据分析路由 - Redis数据分析和统计

// 记录用户行为
router.post('/track', async (req, res) => {
  try {
    const { event, userId, data = {} } = req.body;
    
    if (!event) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['event']
      });
    }

    const timestamp = Date.now();
    const eventData = {
      event,
      userId: userId || 'anonymous',
      timestamp,
      data,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    };

    // 存储事件到流
    await req.redis.xAdd('analytics:events', '*', eventData);

    // 更新实时统计
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hourKey = new Date().toISOString().substring(0, 13); // YYYY-MM-DDTHH
    
    const pipeline = req.redis.multi();
    
    // 总事件计数
    pipeline.incr(`analytics:count:total`);
    pipeline.incr(`analytics:count:event:${event}`);
    pipeline.incr(`analytics:count:date:${dateKey}`);
    pipeline.incr(`analytics:count:hour:${hourKey}`);
    
    // 用户活跃度
    if (userId) {
      pipeline.incr(`analytics:count:user:${userId}`);
      pipeline.sAdd(`analytics:active_users:${dateKey}`, userId);
    }
    
    await pipeline.exec();

    res.json({
      success: true,
      message: '事件记录成功',
      event,
      userId: userId || 'anonymous',
      timestamp
    });
  } catch (error) {
    res.status(500).json({
      error: '记录事件失败',
      message: error.message
    });
  }
});

// 获取实时统计
router.get('/realtime', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.toISOString().substring(0, 13);
    
    const [
      totalEvents,
      todayEvents,
      currentHourEvents,
      activeUsersToday
    ] = await Promise.all([
      req.redis.get('analytics:count:total'),
      req.redis.get(`analytics:count:date:${today}`),
      req.redis.get(`analytics:count:hour:${currentHour}`),
      req.redis.sCard(`analytics:active_users:${today}`)
    ]);

    // 获取最近24小时的数据
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString().substring(0, 13);
      const count = await req.redis.get(`analytics:count:hour:${hour}`);
      hourlyData.push({
        hour: hour.substring(11, 13) + ':00',
        events: parseInt(count) || 0
      });
    }

    // 获取热门事件
    const eventKeys = [];
    let cursor = 0;
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'analytics:count:event:*',
        COUNT: 100
      });
      cursor = result.cursor;
      eventKeys.push(...result.keys);
    } while (cursor !== 0);

    const topEvents = [];
    for (const key of eventKeys) {
      const count = await req.redis.get(key);
      const eventName = key.replace('analytics:count:event:', '');
      topEvents.push({
        event: eventName,
        count: parseInt(count) || 0
      });
    }
    
    topEvents.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      message: '实时统计数据',
      data: {
        overview: {
          totalEvents: parseInt(totalEvents) || 0,
          todayEvents: parseInt(todayEvents) || 0,
          currentHourEvents: parseInt(currentHourEvents) || 0,
          activeUsersToday: activeUsersToday || 0
        },
        hourlyTrend: hourlyData,
        topEvents: topEvents.slice(0, 10)
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '获取实时统计失败',
      message: error.message
    });
  }
});

// 用户行为分析
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;
    
    // 获取用户总活动数
    const userEventCount = await req.redis.get(`analytics:count:user:${userId}`);
    
    // 获取用户最近几天的活动
    const dailyActivity = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const isActive = await req.redis.sIsMember(`analytics:active_users:${date}`, userId);
      dailyActivity.push({
        date,
        active: isActive === 1
      });
    }

    // 从事件流中获取用户最近的事件
    const recentEvents = [];
    try {
      const events = await req.redis.xRange('analytics:events', '-', '+', { COUNT: 1000 });
      
      for (const [id, fields] of events) {
        if (fields.userId === userId) {
          recentEvents.push({
            id,
            event: fields.event,
            timestamp: new Date(parseInt(fields.timestamp)).toISOString(),
            data: fields.data ? JSON.parse(fields.data) : {}
          });
        }
      }
      
      recentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (streamError) {
      console.warn('获取用户事件流失败:', streamError.message);
    }

    // 分析用户行为模式
    const eventTypes = {};
    recentEvents.forEach(event => {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1;
    });

    res.json({
      success: true,
      message: '用户行为分析',
      userId,
      data: {
        summary: {
          totalEvents: parseInt(userEventCount) || 0,
          activeDays: dailyActivity.filter(day => day.active).length,
          eventTypes: Object.keys(eventTypes).length
        },
        dailyActivity,
        eventDistribution: Object.entries(eventTypes).map(([event, count]) => ({
          event,
          count
        })).sort((a, b) => b.count - a.count),
        recentEvents: recentEvents.slice(0, 20)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '用户行为分析失败',
      message: error.message
    });
  }
});

// 漏斗分析
router.post('/funnel', async (req, res) => {
  try {
    const { steps, timeRange = 7 } = req.body;
    
    if (!steps || !Array.isArray(steps) || steps.length < 2) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'steps: [step1, step2, step3, ...] (至少2个步骤)'
      });
    }

    const endTime = Date.now();
    const startTime = endTime - (timeRange * 24 * 60 * 60 * 1000);

    // 获取指定时间范围内的事件
    const events = await req.redis.xRange('analytics:events', startTime, endTime);
    
    // 按用户分组事件
    const userEvents = {};
    for (const [id, fields] of events) {
      const userId = fields.userId;
      if (!userEvents[userId]) {
        userEvents[userId] = [];
      }
      userEvents[userId].push({
        event: fields.event,
        timestamp: parseInt(fields.timestamp)
      });
    }

    // 计算漏斗转化
    const funnelData = [];
    let previousStepUsers = new Set();
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const usersInStep = new Set();
      
      for (const [userId, userEventList] of Object.entries(userEvents)) {
        const hasEvent = userEventList.some(event => event.event === step);
        
        if (hasEvent) {
          // 第一步或者用户在前一步中
          if (i === 0 || previousStepUsers.has(userId)) {
            usersInStep.add(userId);
          }
        }
      }
      
      const userCount = usersInStep.size;
      const conversionRate = i === 0 ? 100 : 
        (previousStepUsers.size > 0 ? (userCount / previousStepUsers.size * 100) : 0);
      
      funnelData.push({
        step: i + 1,
        event: step,
        users: userCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropOff: i === 0 ? 0 : previousStepUsers.size - userCount
      });
      
      previousStepUsers = usersInStep;
    }

    res.json({
      success: true,
      message: '漏斗分析完成',
      timeRange: `${timeRange}天`,
      funnel: funnelData,
      summary: {
        totalUsers: funnelData[0]?.users || 0,
        completedUsers: funnelData[funnelData.length - 1]?.users || 0,
        overallConversion: funnelData.length > 1 ? 
          Math.round((funnelData[funnelData.length - 1].users / funnelData[0].users * 100) * 100) / 100 : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '漏斗分析失败',
      message: error.message
    });
  }
});

// 留存分析
router.get('/retention', async (req, res) => {
  try {
    const { cohortDate, days = 7 } = req.query;
    
    if (!cohortDate) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['cohortDate (YYYY-MM-DD)']
      });
    }

    // 获取初始用户群
    const cohortUsers = await req.redis.sMembers(`analytics:active_users:${cohortDate}`);
    
    if (cohortUsers.length === 0) {
      return res.json({
        success: true,
        message: '留存分析',
        cohortDate,
        cohortSize: 0,
        retention: []
      });
    }

    // 计算每天的留存率
    const retentionData = [];
    
    for (let day = 0; day < parseInt(days); day++) {
      const checkDate = new Date(new Date(cohortDate).getTime() + day * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      const activeUsers = await req.redis.sMembers(`analytics:active_users:${checkDate}`);
      const retainedUsers = cohortUsers.filter(user => activeUsers.includes(user));
      
      const retentionRate = (retainedUsers.length / cohortUsers.length * 100);
      
      retentionData.push({
        day,
        date: checkDate,
        retainedUsers: retainedUsers.length,
        retentionRate: Math.round(retentionRate * 100) / 100
      });
    }

    res.json({
      success: true,
      message: '留存分析',
      cohortDate,
      cohortSize: cohortUsers.length,
      retention: retentionData
    });
  } catch (error) {
    res.status(500).json({
      error: '留存分析失败',
      message: error.message
    });
  }
});

// A/B测试分析
router.post('/ab-test', async (req, res) => {
  try {
    const { testName, variants, metric } = req.body;
    
    if (!testName || !variants || !Array.isArray(variants) || !metric) {
      return res.status(400).json({
        error: '参数格式错误',
        required: ['testName', 'variants (array)', 'metric']
      });
    }

    const results = [];
    
    for (const variant of variants) {
      // 获取该变体的用户
      const variantUsers = await req.redis.sMembers(`ab_test:${testName}:${variant}`);
      
      // 计算该变体的指标
      let metricSum = 0;
      let userCount = variantUsers.length;
      
      for (const userId of variantUsers) {
        const userMetric = await req.redis.get(`analytics:metric:${metric}:${userId}`);
        metricSum += parseInt(userMetric) || 0;
      }
      
      const avgMetric = userCount > 0 ? metricSum / userCount : 0;
      
      results.push({
        variant,
        users: userCount,
        totalMetric: metricSum,
        avgMetric: Math.round(avgMetric * 100) / 100
      });
    }

    // 计算统计显著性（简化版）
    if (results.length === 2) {
      const [control, treatment] = results;
      const improvement = control.avgMetric > 0 ? 
        ((treatment.avgMetric - control.avgMetric) / control.avgMetric * 100) : 0;
      
      results.forEach((result, index) => {
        result.isControl = index === 0;
        result.improvement = index === 0 ? 0 : Math.round(improvement * 100) / 100;
      });
    }

    res.json({
      success: true,
      message: 'A/B测试分析',
      testName,
      metric,
      results,
      summary: {
        totalUsers: results.reduce((sum, r) => sum + r.users, 0),
        bestVariant: results.reduce((best, current) => 
          current.avgMetric > best.avgMetric ? current : best, results[0])?.variant
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'A/B测试分析失败',
      message: error.message
    });
  }
});

// 获取分析演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建演示分析数据
    const demoEvents = [
      'page_view', 'button_click', 'form_submit', 'purchase', 'signup',
      'login', 'logout', 'search', 'add_to_cart', 'checkout'
    ];

    const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
    const pipeline = req.redis.multi();
    
    // 生成过去7天的演示数据
    for (let day = 6; day >= 0; day--) {
      const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // 每天随机生成一些事件
      for (let i = 0; i < Math.floor(Math.random() * 50) + 20; i++) {
        const event = demoEvents[Math.floor(Math.random() * demoEvents.length)];
        const userId = users[Math.floor(Math.random() * users.length)];
        const timestamp = date.getTime() + Math.random() * 24 * 60 * 60 * 1000;
        
        // 更新计数器
        pipeline.incr(`analytics:count:total`);
        pipeline.incr(`analytics:count:event:${event}`);
        pipeline.incr(`analytics:count:date:${dateStr}`);
        pipeline.incr(`analytics:count:user:${userId}`);
        pipeline.sAdd(`analytics:active_users:${dateStr}`, userId);
        
        // 添加到事件流
        pipeline.xAdd('analytics:events', '*', {
          event,
          userId,
          timestamp: timestamp.toString(),
          data: JSON.stringify({ demo: true })
        });
      }
    }

    // 创建A/B测试演示数据
    users.forEach((userId, index) => {
      const variant = index % 2 === 0 ? 'control' : 'treatment';
      pipeline.sAdd(`ab_test:button_color:${variant}`, userId);
      pipeline.set(`analytics:metric:conversion:${userId}`, Math.floor(Math.random() * 10));
    });

    await pipeline.exec();

    // 获取当前统计
    const [totalEvents, todayEvents] = await Promise.all([
      req.redis.get('analytics:count:total'),
      req.redis.get(`analytics:count:date:${new Date().toISOString().split('T')[0]}`)
    ]);

    res.json({
      success: true,
      message: '数据分析演示数据',
      data: {
        overview: {
          totalEvents: parseInt(totalEvents) || 0,
          todayEvents: parseInt(todayEvents) || 0,
          demoUsers: users.length
        },
        features: [
          '实时事件跟踪',
          '用户行为分析',
          '漏斗转化分析',
          '用户留存分析',
          'A/B测试分析',
          '自定义指标统计'
        ],
        useCases: [
          '网站流量分析',
          '用户行为监控',
          '转化率优化',
          '产品功能分析',
          '营销效果评估',
          '用户生命周期管理'
        ],
        endpoints: [
          'POST /api/analytics/track - 记录事件',
          'GET /api/analytics/realtime - 实时统计',
          'GET /api/analytics/user/:id - 用户分析',
          'POST /api/analytics/funnel - 漏斗分析',
          'GET /api/analytics/retention - 留存分析',
          'POST /api/analytics/ab-test - A/B测试分析'
        ]
      },
      examples: {
        trackEvent: {
          event: 'button_click',
          userId: 'user123',
          data: { button_id: 'cta_button', page: '/landing' }
        },
        funnelAnalysis: {
          steps: ['page_view', 'add_to_cart', 'checkout', 'purchase'],
          timeRange: 7
        },
        retentionAnalysis: {
          cohortDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days: 7
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '创建分析演示数据失败',
      message: error.message
    });
  }
});

// 数据导出
router.get('/export', async (req, res) => {
  try {
    const { type = 'events', startDate, endDate, format = 'json' } = req.query;
    
    let data = [];
    
    switch (type) {
      case 'events':
        const events = await req.redis.xRange('analytics:events', 
          startDate ? new Date(startDate).getTime() : '-',
          endDate ? new Date(endDate).getTime() : '+'
        );
        
        data = events.map(([id, fields]) => ({
          id,
          event: fields.event,
          userId: fields.userId,
          timestamp: new Date(parseInt(fields.timestamp)).toISOString(),
          data: fields.data ? JSON.parse(fields.data) : {}
        }));
        break;

      case 'daily_stats':
        const days = [];
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const events = await req.redis.get(`analytics:count:date:${dateStr}`);
          const activeUsers = await req.redis.sCard(`analytics:active_users:${dateStr}`);
          
          days.push({
            date: dateStr,
            events: parseInt(events) || 0,
            activeUsers: activeUsers || 0
          });
        }
        data = days;
        break;

      default:
        return res.status(400).json({
          error: '不支持的导出类型',
          supportedTypes: ['events', 'daily_stats']
        });
    }

    if (format === 'csv') {
      // 简化的CSV格式
      const csvHeader = Object.keys(data[0] || {}).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics_${type}_${Date.now()}.csv"`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        message: '数据导出成功',
        type,
        format,
        count: data.length,
        data
      });
    }
  } catch (error) {
    res.status(500).json({
      error: '数据导出失败',
      message: error.message
    });
  }
});

// 清理分析数据
router.delete('/cleanup', async (req, res) => {
  try {
    const { olderThan = 30 } = req.query; // 默认清理30天前的数据
    
    const cutoffTime = Date.now() - (parseInt(olderThan) * 24 * 60 * 60 * 1000);
    
    // 清理事件流中的旧数据
    const trimmed = await req.redis.xTrim('analytics:events', 'MINID', cutoffTime);
    
    // 清理旧的日期统计
    let cursor = 0;
    const keysToDelete = [];
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: 'analytics:*',
        COUNT: 100
      });
      cursor = result.cursor;
      
      for (const key of result.keys) {
        // 检查是否是日期相关的键
        const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const keyDate = new Date(dateMatch[1]).getTime();
          if (keyDate < cutoffTime) {
            keysToDelete.push(key);
          }
        }
      }
    } while (cursor !== 0);

    let deletedKeys = 0;
    if (keysToDelete.length > 0) {
      deletedKeys = await req.redis.del(keysToDelete);
    }

    res.json({
      success: true,
      message: '数据清理完成',
      olderThan: `${olderThan}天`,
      trimmedEvents: trimmed,
      deletedKeys,
      cleanupTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '数据清理失败',
      message: error.message
    });
  }
});

module.exports = router; 