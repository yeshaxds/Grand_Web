const express = require('express');
const router = express.Router();

// 流操作路由 - Redis Stream数据类型

// 添加消息到流
router.post('/xadd', async (req, res) => {
  try {
    const { key, fields, id = '*' } = req.body;
    
    if (!key || !fields || typeof fields !== 'object') {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, fields: {field1: value1, field2: value2, ...}, id?: string'
      });
    }

    const messageId = await req.redis.xAdd(key, id, fields);

    res.json({
      success: true,
      message: '消息添加成功',
      key,
      messageId,
      fields
    });
  } catch (error) {
    res.status(500).json({
      error: '添加消息失败',
      message: error.message
    });
  }
});

// 读取流消息
router.get('/xrange/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { start = '-', end = '+', count } = req.query;
    
    const options = {};
    if (count) {
      options.COUNT = parseInt(count);
    }

    const messages = await req.redis.xRange(key, start, end, options);

    res.json({
      success: true,
      key,
      messages,
      count: messages.length,
      range: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      error: '读取流消息失败',
      message: error.message
    });
  }
});

// 获取流长度
router.get('/xlen/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const length = await req.redis.xLen(key);

    res.json({
      success: true,
      key,
      length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取流长度失败',
      message: error.message
    });
  }
});

// 创建消费者组
router.post('/xgroup-create', async (req, res) => {
  try {
    const { key, groupName, id = '$', mkStream = true } = req.body;
    
    if (!key || !groupName) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'groupName']
      });
    }

    await req.redis.xGroupCreate(key, groupName, id, { MKSTREAM: mkStream });

    res.json({
      success: true,
      message: '消费者组创建成功',
      key,
      groupName,
      startId: id
    });
  } catch (error) {
    res.status(500).json({
      error: '创建消费者组失败',
      message: error.message
    });
  }
});

// 从消费者组读取消息
router.post('/xreadgroup', async (req, res) => {
  try {
    const { groupName, consumerName, streams, count = 10, block } = req.body;
    
    if (!groupName || !consumerName || !streams || !Array.isArray(streams)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'groupName: string, consumerName: string, streams: [{key: string, id: string}]'
      });
    }

    const options = { COUNT: count };
    if (block !== undefined) {
      options.BLOCK = block;
    }

    const streamArgs = {};
    streams.forEach(stream => {
      streamArgs[stream.key] = stream.id;
    });

    const messages = await req.redis.xReadGroup(groupName, consumerName, streamArgs, options);

    res.json({
      success: true,
      groupName,
      consumerName,
      messages: messages || [],
      count: messages ? messages.length : 0
    });
  } catch (error) {
    res.status(500).json({
      error: '从消费者组读取失败',
      message: error.message
    });
  }
});

// 确认消息处理
router.post('/xack', async (req, res) => {
  try {
    const { key, groupName, messageIds } = req.body;
    
    if (!key || !groupName || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, groupName: string, messageIds: [id1, id2, ...]'
      });
    }

    const acknowledged = await req.redis.xAck(key, groupName, messageIds);

    res.json({
      success: true,
      message: '消息确认成功',
      key,
      groupName,
      messageIds,
      acknowledged
    });
  } catch (error) {
    res.status(500).json({
      error: '确认消息失败',
      message: error.message
    });
  }
});

// 获取流信息
router.get('/xinfo-stream/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const info = await req.redis.xInfoStream(key);

    res.json({
      success: true,
      key,
      info
    });
  } catch (error) {
    res.status(500).json({
      error: '获取流信息失败',
      message: error.message
    });
  }
});

// 删除消息
router.delete('/xdel/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'messageIds: [id1, id2, ...]'
      });
    }

    const deleted = await req.redis.xDel(key, messageIds);

    res.json({
      success: true,
      message: '消息删除成功',
      key,
      messageIds,
      deleted
    });
  } catch (error) {
    res.status(500).json({
      error: '删除消息失败',
      message: error.message
    });
  }
});

// 修剪流
router.post('/xtrim', async (req, res) => {
  try {
    const { key, strategy, threshold, approximate = false } = req.body;
    
    if (!key || !strategy || threshold === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'strategy (MAXLEN/MINID)', 'threshold']
      });
    }

    const options = {};
    if (approximate) {
      options.APPROXIMATE = true;
    }

    let trimmed;
    if (strategy.toUpperCase() === 'MAXLEN') {
      trimmed = await req.redis.xTrim(key, 'MAXLEN', threshold, options);
    } else if (strategy.toUpperCase() === 'MINID') {
      trimmed = await req.redis.xTrim(key, 'MINID', threshold, options);
    } else {
      return res.status(400).json({
        error: '无效的修剪策略',
        validStrategies: ['MAXLEN', 'MINID']
      });
    }

    res.json({
      success: true,
      message: '流修剪成功',
      key,
      strategy,
      threshold,
      trimmed
    });
  } catch (error) {
    res.status(500).json({
      error: '修剪流失败',
      message: error.message
    });
  }
});

// 获取流演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建日志流
    const logStream = 'demo:logs:app';
    await req.redis.del(logStream);
    
    const logMessages = [
      { level: 'INFO', message: '应用启动成功', module: 'app', timestamp: Date.now() - 5000 },
      { level: 'DEBUG', message: '数据库连接建立', module: 'db', timestamp: Date.now() - 4000 },
      { level: 'WARN', message: '内存使用率较高', module: 'monitor', timestamp: Date.now() - 3000 },
      { level: 'ERROR', message: '用户认证失败', module: 'auth', timestamp: Date.now() - 2000 },
      { level: 'INFO', message: '定时任务执行完成', module: 'scheduler', timestamp: Date.now() - 1000 }
    ];

    for (const log of logMessages) {
      await req.redis.xAdd(logStream, '*', log);
    }

    // 创建订单流
    const orderStream = 'demo:orders:events';
    await req.redis.del(orderStream);
    
    const orderEvents = [
      { orderId: 'ORD001', event: 'created', amount: '99.99', userId: 'user123' },
      { orderId: 'ORD001', event: 'paid', paymentId: 'pay456', method: 'credit_card' },
      { orderId: 'ORD002', event: 'created', amount: '149.99', userId: 'user789' },
      { orderId: 'ORD001', event: 'shipped', trackingId: 'track789', carrier: 'SF' },
      { orderId: 'ORD002', event: 'cancelled', reason: 'user_request' }
    ];

    for (const order of orderEvents) {
      await req.redis.xAdd(orderStream, '*', order);
    }

    // 创建实时数据流
    const metricsStream = 'demo:metrics:realtime';
    await req.redis.del(metricsStream);
    
    const metricsData = [
      { cpu: '45.2', memory: '67.8', disk: '23.1', network_in: '1024', network_out: '2048' },
      { cpu: '52.1', memory: '69.3', disk: '23.2', network_in: '1156', network_out: '2234' },
      { cpu: '48.7', memory: '71.2', disk: '23.3', network_in: '1089', network_out: '1987' },
      { cpu: '61.3', memory: '73.5', disk: '23.4', network_in: '1345', network_out: '2456' },
      { cpu: '55.9', memory: '72.1', disk: '23.5', network_in: '1278', network_out: '2123' }
    ];

    for (const metric of metricsData) {
      await req.redis.xAdd(metricsStream, '*', metric);
    }

    // 获取演示数据
    const [
      logMessages_result,
      orderEvents_result,
      metricsData_result
    ] = await Promise.all([
      req.redis.xRange(logStream, '-', '+'),
      req.redis.xRange(orderStream, '-', '+'),
      req.redis.xRange(metricsStream, '-', '+')
    ]);

    // 获取流信息
    const [
      logInfo,
      orderInfo,
      metricsInfo
    ] = await Promise.all([
      req.redis.xInfoStream(logStream).catch(() => null),
      req.redis.xInfoStream(orderStream).catch(() => null),
      req.redis.xInfoStream(metricsStream).catch(() => null)
    ]);

    res.json({
      success: true,
      message: '流演示数据',
      data: {
        appLogs: {
          key: logStream,
          messages: logMessages_result,
          count: logMessages_result.length,
          info: logInfo,
          description: '应用日志流 - 实时日志记录'
        },
        orderEvents: {
          key: orderStream,
          messages: orderEvents_result,
          count: orderEvents_result.length,
          info: orderInfo,
          description: '订单事件流 - 订单状态变化'
        },
        realtimeMetrics: {
          key: metricsStream,
          messages: metricsData_result,
          count: metricsData_result.length,
          info: metricsInfo,
          description: '实时指标流 - 系统监控数据'
        }
      },
      useCases: [
        '日志收集和分析',
        '事件溯源系统',
        '实时数据处理',
        '消息队列',
        '活动流记录',
        '监控指标收集'
      ],
      operations: [
        'XADD - 添加消息到流',
        'XRANGE - 读取消息范围',
        'XLEN - 获取流长度',
        'XGROUP CREATE - 创建消费者组',
        'XREADGROUP - 从组读取消息',
        'XACK - 确认消息处理',
        'XINFO STREAM - 获取流信息',
        'XDEL - 删除消息',
        'XTRIM - 修剪流'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建流演示数据失败',
      message: error.message
    });
  }
});

module.exports = router; 