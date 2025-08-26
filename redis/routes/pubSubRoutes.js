const express = require('express');
const router = express.Router();

// 发布订阅路由 - Redis Pub/Sub功能

// 发布消息
router.post('/publish', async (req, res) => {
  try {
    const { channel, message } = req.body;
    
    if (!channel || message === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['channel', 'message']
      });
    }

    const subscribers = await req.redis.publish(channel, JSON.stringify(message));

    res.json({
      success: true,
      message: '消息发布成功',
      channel,
      data: message,
      subscribers
    });
  } catch (error) {
    res.status(500).json({
      error: '发布消息失败',
      message: error.message
    });
  }
});

// 获取频道信息
router.get('/channels', async (req, res) => {
  try {
    const { pattern = '*' } = req.query;
    const channels = await req.redis.pubSubChannels(pattern);

    res.json({
      success: true,
      channels,
      count: channels.length,
      pattern
    });
  } catch (error) {
    res.status(500).json({
      error: '获取频道信息失败',
      message: error.message
    });
  }
});

// 获取频道订阅者数量
router.get('/numsub', async (req, res) => {
  try {
    const { channels } = req.query;
    
    if (!channels) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['channels (comma separated)']
      });
    }

    const channelArray = channels.split(',').map(c => c.trim());
    const result = await req.redis.pubSubNumSub(channelArray);
    
    // 转换结果为对象格式
    const subscriptions = {};
    for (let i = 0; i < result.length; i += 2) {
      subscriptions[result[i]] = result[i + 1];
    }

    res.json({
      success: true,
      subscriptions,
      channels: channelArray
    });
  } catch (error) {
    res.status(500).json({
      error: '获取订阅者数量失败',
      message: error.message
    });
  }
});

// 获取模式订阅数量
router.get('/numpat', async (req, res) => {
  try {
    const patterns = await req.redis.pubSubNumPat();

    res.json({
      success: true,
      patterns
    });
  } catch (error) {
    res.status(500).json({
      error: '获取模式订阅数量失败',
      message: error.message
    });
  }
});

// 模拟订阅演示
router.get('/demo-subscribe/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const { duration = 5000 } = req.query;
    
    // 创建一个新的Redis客户端用于订阅
    const { createClient } = require('redis');
    const subscriber = createClient({
      host: 'localhost',
      port: 6379
    });
    
    await subscriber.connect();
    
    const messages = [];
    const startTime = Date.now();
    
    // 设置消息处理器
    subscriber.on('message', (channel, message) => {
      messages.push({
        channel,
        message: JSON.parse(message),
        timestamp: Date.now()
      });
    });
    
    // 订阅频道
    await subscriber.subscribe(channel);
    
    // 等待指定时间
    setTimeout(async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
      
      res.json({
        success: true,
        message: `订阅演示完成 (${duration}ms)`,
        channel,
        messagesReceived: messages,
        count: messages.length,
        duration: Date.now() - startTime
      });
    }, parseInt(duration));
    
  } catch (error) {
    res.status(500).json({
      error: '订阅演示失败',
      message: error.message
    });
  }
});

// 批量发布演示消息
router.post('/demo-publish', async (req, res) => {
  try {
    const { channel = 'demo:notifications', count = 5 } = req.body;
    
    const messages = [];
    const results = [];
    
    for (let i = 1; i <= count; i++) {
      const message = {
        id: `msg_${i}`,
        type: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)],
        content: `这是第 ${i} 条演示消息`,
        timestamp: Date.now(),
        sender: 'demo_publisher'
      };
      
      messages.push(message);
      const subscribers = await req.redis.publish(channel, JSON.stringify(message));
      results.push({ message, subscribers });
      
      // 间隔发送
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      success: true,
      message: '批量发布完成',
      channel,
      published: results,
      totalMessages: count
    });
  } catch (error) {
    res.status(500).json({
      error: '批量发布失败',
      message: error.message
    });
  }
});

// 获取发布订阅演示数据
router.get('/demo', async (req, res) => {
  try {
    // 模拟发布一些演示消息到不同频道
    const channels = {
      'demo:news': [
        { title: '科技新闻', content: 'Redis 7.0 发布新特性', category: 'tech' },
        { title: '体育新闻', content: '世界杯决赛即将开始', category: 'sports' },
        { title: '财经新闻', content: '股市今日上涨3%', category: 'finance' }
      ],
      'demo:notifications': [
        { type: 'info', message: '系统维护通知', urgent: false },
        { type: 'warning', message: '磁盘空间不足', urgent: true },
        { type: 'success', message: '备份完成', urgent: false }
      ],
      'demo:chat:room1': [
        { user: 'Alice', message: '大家好！', timestamp: Date.now() - 3000 },
        { user: 'Bob', message: '你好Alice', timestamp: Date.now() - 2000 },
        { user: 'Charlie', message: '今天天气不错', timestamp: Date.now() - 1000 }
      ],
      'demo:events': [
        { event: 'user_login', userId: 'user123', ip: '192.168.1.100' },
        { event: 'order_created', orderId: 'ord456', amount: 99.99 },
        { event: 'payment_completed', orderId: 'ord456', method: 'credit_card' }
      ]
    };

    const publishResults = {};
    
    for (const [channel, messages] of Object.entries(channels)) {
      publishResults[channel] = [];
      
      for (const message of messages) {
        const enrichedMessage = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          channel
        };
        
        const subscribers = await req.redis.publish(channel, JSON.stringify(enrichedMessage));
        publishResults[channel].push({
          message: enrichedMessage,
          subscribers
        });
      }
    }

    // 获取频道信息
    const activeChannels = await req.redis.pubSubChannels('demo:*');
    const channelSubscriptions = {};
    
    if (activeChannels.length > 0) {
      const subCounts = await req.redis.pubSubNumSub(activeChannels);
      for (let i = 0; i < subCounts.length; i += 2) {
        channelSubscriptions[subCounts[i]] = subCounts[i + 1];
      }
    }

    res.json({
      success: true,
      message: '发布订阅演示数据',
      data: {
        publishResults,
        activeChannels,
        channelSubscriptions,
        totalChannels: Object.keys(channels).length,
        totalMessages: Object.values(channels).reduce((sum, msgs) => sum + msgs.length, 0)
      },
      useCases: [
        '实时通知系统',
        '聊天应用',
        '新闻推送',
        '事件广播',
        '系统监控告警',
        '实时数据同步'
      ],
      operations: [
        'PUBLISH - 发布消息',
        'SUBSCRIBE - 订阅频道',
        'UNSUBSCRIBE - 取消订阅',
        'PSUBSCRIBE - 模式订阅',
        'PUNSUBSCRIBE - 取消模式订阅',
        'PUBSUB CHANNELS - 获取活跃频道',
        'PUBSUB NUMSUB - 获取订阅者数量',
        'PUBSUB NUMPAT - 获取模式订阅数量'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建发布订阅演示数据失败',
      message: error.message
    });
  }
});

// WebSocket支持的实时订阅端点
router.get('/realtime/:channel', (req, res) => {
  const { channel } = req.params;
  
  // 设置SSE头部
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // 创建订阅客户端
  const { createClient } = require('redis');
  const subscriber = createClient({
    host: 'localhost',
    port: 6379
  });

  subscriber.connect().then(() => {
    // 订阅频道
    subscriber.subscribe(channel);
    
    // 监听消息
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        res.write(`data: ${JSON.stringify({
          channel: receivedChannel,
          message: JSON.parse(message),
          timestamp: Date.now()
        })}\n\n`);
      }
    });

    // 发送连接确认
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      channel,
      timestamp: Date.now()
    })}\n\n`);
  });

  // 客户端断开连接时清理
  req.on('close', async () => {
    try {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    } catch (error) {
      console.error('清理订阅客户端失败:', error);
    }
  });
});

module.exports = router; 