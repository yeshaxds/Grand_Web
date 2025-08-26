const express = require('express');
const router = express.Router();

// 列表操作路由 - Redis的列表数据类型

// 左侧推入元素
router.post('/lpush', async (req, res) => {
  try {
    const { key, values } = req.body;
    
    if (!key || !values || !Array.isArray(values)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, values: [value1, value2, ...]'
      });
    }

    const length = await req.redis.lPush(key, values);

    res.json({
      success: true,
      message: '左侧推入成功',
      key,
      values,
      newLength: length
    });
  } catch (error) {
    res.status(500).json({
      error: '左侧推入失败',
      message: error.message
    });
  }
});

// 右侧推入元素
router.post('/rpush', async (req, res) => {
  try {
    const { key, values } = req.body;
    
    if (!key || !values || !Array.isArray(values)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, values: [value1, value2, ...]'
      });
    }

    const length = await req.redis.rPush(key, values);

    res.json({
      success: true,
      message: '右侧推入成功',
      key,
      values,
      newLength: length
    });
  } catch (error) {
    res.status(500).json({
      error: '右侧推入失败',
      message: error.message
    });
  }
});

// 左侧弹出元素
router.post('/lpop/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { count = 1 } = req.body;
    
    let result;
    if (count === 1) {
      result = await req.redis.lPop(key);
    } else {
      result = await req.redis.lPopCount(key, count);
    }

    if (result === null || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({
        error: '列表为空或不存在',
        key
      });
    }

    res.json({
      success: true,
      message: '左侧弹出成功',
      key,
      popped: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    res.status(500).json({
      error: '左侧弹出失败',
      message: error.message
    });
  }
});

// 右侧弹出元素
router.post('/rpop/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { count = 1 } = req.body;
    
    let result;
    if (count === 1) {
      result = await req.redis.rPop(key);
    } else {
      result = await req.redis.rPopCount(key, count);
    }

    if (result === null || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({
        error: '列表为空或不存在',
        key
      });
    }

    res.json({
      success: true,
      message: '右侧弹出成功',
      key,
      popped: result,
      count: Array.isArray(result) ? result.length : 1
    });
  } catch (error) {
    res.status(500).json({
      error: '右侧弹出失败',
      message: error.message
    });
  }
});

// 获取列表范围元素
router.get('/lrange/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { start = 0, stop = -1 } = req.query;
    
    const elements = await req.redis.lRange(key, parseInt(start), parseInt(stop));

    res.json({
      success: true,
      key,
      elements,
      count: elements.length,
      range: {
        start: parseInt(start),
        stop: parseInt(stop)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '获取列表范围失败',
      message: error.message
    });
  }
});

// 获取列表长度
router.get('/llen/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const length = await req.redis.lLen(key);

    res.json({
      success: true,
      key,
      length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取列表长度失败',
      message: error.message
    });
  }
});

// 获取指定索引的元素
router.get('/lindex/:key/:index', async (req, res) => {
  try {
    const { key, index } = req.params;
    const element = await req.redis.lIndex(key, parseInt(index));

    if (element === null) {
      return res.status(404).json({
        error: '索引超出范围或列表不存在',
        key,
        index: parseInt(index)
      });
    }

    res.json({
      success: true,
      key,
      index: parseInt(index),
      element
    });
  } catch (error) {
    res.status(500).json({
      error: '获取元素失败',
      message: error.message
    });
  }
});

// 设置指定索引的元素值
router.post('/lset', async (req, res) => {
  try {
    const { key, index, value } = req.body;
    
    if (!key || index === undefined || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'index', 'value']
      });
    }

    await req.redis.lSet(key, index, value);

    res.json({
      success: true,
      message: '设置元素值成功',
      key,
      index,
      value
    });
  } catch (error) {
    res.status(500).json({
      error: '设置元素值失败',
      message: error.message
    });
  }
});

// 在指定元素前/后插入新元素
router.post('/linsert', async (req, res) => {
  try {
    const { key, position, pivot, element } = req.body;
    
    if (!key || !position || !pivot || element === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'position (BEFORE/AFTER)', 'pivot', 'element']
      });
    }

    const newLength = await req.redis.lInsert(key, position.toUpperCase(), pivot, element);

    if (newLength === -1) {
      return res.status(404).json({
        error: '基准元素不存在',
        key,
        pivot
      });
    }

    res.json({
      success: true,
      message: '插入元素成功',
      key,
      position: position.toUpperCase(),
      pivot,
      element,
      newLength
    });
  } catch (error) {
    res.status(500).json({
      error: '插入元素失败',
      message: error.message
    });
  }
});

// 移除指定元素
router.post('/lrem', async (req, res) => {
  try {
    const { key, count, element } = req.body;
    
    if (!key || count === undefined || element === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'count', 'element']
      });
    }

    const removedCount = await req.redis.lRem(key, count, element);

    res.json({
      success: true,
      message: '移除元素成功',
      key,
      element,
      count,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '移除元素失败',
      message: error.message
    });
  }
});

// 修剪列表
router.post('/ltrim', async (req, res) => {
  try {
    const { key, start, stop } = req.body;
    
    if (!key || start === undefined || stop === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'start', 'stop']
      });
    }

    await req.redis.lTrim(key, start, stop);
    const remainingElements = await req.redis.lRange(key, 0, -1);

    res.json({
      success: true,
      message: '修剪列表成功',
      key,
      trimRange: { start, stop },
      remainingElements,
      remainingCount: remainingElements.length
    });
  } catch (error) {
    res.status(500).json({
      error: '修剪列表失败',
      message: error.message
    });
  }
});

// 获取列表演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建任务队列演示
    const tasks = ['task1', 'task2', 'task3', 'task4', 'task5'];
    await req.redis.del('demo:task_queue'); // 清空现有数据
    await req.redis.rPush('demo:task_queue', tasks);

    // 创建消息历史演示
    const messages = [
      JSON.stringify({ user: 'Alice', message: 'Hello!', timestamp: Date.now() - 5000 }),
      JSON.stringify({ user: 'Bob', message: 'Hi there!', timestamp: Date.now() - 4000 }),
      JSON.stringify({ user: 'Charlie', message: 'How are you?', timestamp: Date.now() - 3000 }),
      JSON.stringify({ user: 'Alice', message: 'Fine, thanks!', timestamp: Date.now() - 2000 }),
      JSON.stringify({ user: 'Bob', message: 'Great!', timestamp: Date.now() - 1000 })
    ];
    await req.redis.del('demo:chat_history');
    await req.redis.rPush('demo:chat_history', messages);

    // 创建最近访问记录演示
    const recentPages = ['/home', '/products', '/about', '/contact', '/profile'];
    await req.redis.del('demo:recent_pages');
    await req.redis.lPush('demo:recent_pages', recentPages);

    // 获取演示数据
    const taskQueue = await req.redis.lRange('demo:task_queue', 0, -1);
    const chatHistory = await req.redis.lRange('demo:chat_history', 0, -1);
    const recentPagesList = await req.redis.lRange('demo:recent_pages', 0, -1);

    res.json({
      success: true,
      message: '列表演示数据',
      data: {
        taskQueue: {
          key: 'demo:task_queue',
          elements: taskQueue,
          length: taskQueue.length,
          description: '任务队列 - FIFO处理'
        },
        chatHistory: {
          key: 'demo:chat_history',
          elements: chatHistory.map(msg => JSON.parse(msg)),
          length: chatHistory.length,
          description: '聊天历史 - 按时间顺序存储'
        },
        recentPages: {
          key: 'demo:recent_pages',
          elements: recentPagesList,
          length: recentPagesList.length,
          description: '最近访问页面 - LIFO栈结构'
        }
      },
      operations: [
        'LPUSH - 左侧推入元素',
        'RPUSH - 右侧推入元素',
        'LPOP - 左侧弹出元素',
        'RPOP - 右侧弹出元素',
        'LRANGE - 获取范围元素',
        'LLEN - 获取列表长度',
        'LINDEX - 获取指定索引元素',
        'LSET - 设置指定索引元素',
        'LINSERT - 插入元素',
        'LREM - 移除指定元素',
        'LTRIM - 修剪列表'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建列表演示数据失败',
      message: error.message
    });
  }
});

module.exports = router; 