const express = require('express');
const router = express.Router();

// 字符串操作路由 - Redis最基本的数据类型

// 设置字符串值
router.post('/set', async (req, res) => {
  try {
    const { key, value, expire } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'value']
      });
    }

    let result;
    if (expire) {
      // 设置带过期时间的值
      result = await req.redis.setEx(key, expire, value);
    } else {
      // 设置普通值
      result = await req.redis.set(key, value);
    }

    res.json({
      success: true,
      message: '字符串设置成功',
      key,
      value,
      expire: expire || null,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: '设置字符串失败',
      message: error.message
    });
  }
});

// 获取字符串值
router.get('/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await req.redis.get(key);
    
    if (value === null) {
      return res.status(404).json({
        error: '键不存在',
        key
      });
    }

    res.json({
      success: true,
      key,
      value,
      type: typeof value
    });
  } catch (error) {
    res.status(500).json({
      error: '获取字符串失败',
      message: error.message
    });
  }
});

// 批量设置多个字符串
router.post('/mset', async (req, res) => {
  try {
    const { pairs } = req.body;
    
    if (!pairs || !Array.isArray(pairs)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'pairs: [{"key": "value"}, ...]'
      });
    }

    const keyValueArray = [];
    pairs.forEach(pair => {
      Object.entries(pair).forEach(([key, value]) => {
        keyValueArray.push(key, value);
      });
    });

    const result = await req.redis.mSet(keyValueArray);

    res.json({
      success: true,
      message: '批量设置成功',
      count: pairs.length,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: '批量设置失败',
      message: error.message
    });
  }
});

// 批量获取多个字符串
router.post('/mget', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'keys: ["key1", "key2", ...]'
      });
    }

    const values = await req.redis.mGet(keys);
    
    const result = keys.map((key, index) => ({
      key,
      value: values[index],
      exists: values[index] !== null
    }));

    res.json({
      success: true,
      count: keys.length,
      results: result
    });
  } catch (error) {
    res.status(500).json({
      error: '批量获取失败',
      message: error.message
    });
  }
});

// 字符串追加
router.post('/append', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'value']
      });
    }

    const newLength = await req.redis.append(key, value);
    const finalValue = await req.redis.get(key);

    res.json({
      success: true,
      message: '字符串追加成功',
      key,
      appendedValue: value,
      finalValue,
      newLength
    });
  } catch (error) {
    res.status(500).json({
      error: '字符串追加失败',
      message: error.message
    });
  }
});

// 获取字符串长度
router.get('/strlen/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const length = await req.redis.strLen(key);
    
    res.json({
      success: true,
      key,
      length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取长度失败',
      message: error.message
    });
  }
});

// 数值递增
router.post('/incr/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { increment = 1 } = req.body;
    
    let newValue;
    if (increment === 1) {
      newValue = await req.redis.incr(key);
    } else {
      newValue = await req.redis.incrBy(key, increment);
    }

    res.json({
      success: true,
      message: '数值递增成功',
      key,
      increment,
      newValue
    });
  } catch (error) {
    res.status(500).json({
      error: '数值递增失败',
      message: error.message
    });
  }
});

// 数值递减
router.post('/decr/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { decrement = 1 } = req.body;
    
    let newValue;
    if (decrement === 1) {
      newValue = await req.redis.decr(key);
    } else {
      newValue = await req.redis.decrBy(key, decrement);
    }

    res.json({
      success: true,
      message: '数值递减成功',
      key,
      decrement,
      newValue
    });
  } catch (error) {
    res.status(500).json({
      error: '数值递减失败',
      message: error.message
    });
  }
});

// 获取子字符串
router.get('/getrange/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { start = 0, end = -1 } = req.query;
    
    const substring = await req.redis.getRange(key, parseInt(start), parseInt(end));
    const originalValue = await req.redis.get(key);

    res.json({
      success: true,
      key,
      originalValue,
      substring,
      range: {
        start: parseInt(start),
        end: parseInt(end)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '获取子字符串失败',
      message: error.message
    });
  }
});

// 设置子字符串
router.post('/setrange', async (req, res) => {
  try {
    const { key, offset, value } = req.body;
    
    if (!key || offset === undefined || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'offset', 'value']
      });
    }

    const originalValue = await req.redis.get(key) || '';
    const newLength = await req.redis.setRange(key, offset, value);
    const finalValue = await req.redis.get(key);

    res.json({
      success: true,
      message: '子字符串设置成功',
      key,
      originalValue,
      finalValue,
      offset,
      insertedValue: value,
      newLength
    });
  } catch (error) {
    res.status(500).json({
      error: '设置子字符串失败',
      message: error.message
    });
  }
});

// 获取所有字符串键的演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建演示数据
    const demoData = {
      'demo:string:simple': 'Hello Redis!',
      'demo:string:number': '42',
      'demo:string:counter': '0',
      'demo:string:json': JSON.stringify({ name: 'Redis', type: 'Database' }),
      'demo:string:long': '这是一个很长的字符串，用来演示Redis字符串的存储能力。'.repeat(10)
    };

    // 设置演示数据
    for (const [key, value] of Object.entries(demoData)) {
      await req.redis.set(key, value);
    }

    // 获取所有演示数据
    const keys = Object.keys(demoData);
    const values = await req.redis.mGet(keys);
    
    const results = keys.map((key, index) => ({
      key,
      value: values[index],
      length: values[index] ? values[index].length : 0,
      type: 'string'
    }));

    res.json({
      success: true,
      message: '字符串演示数据',
      count: results.length,
      data: results,
      operations: [
        'SET - 设置字符串值',
        'GET - 获取字符串值',
        'MSET - 批量设置',
        'MGET - 批量获取',
        'APPEND - 追加字符串',
        'STRLEN - 获取长度',
        'INCR/DECR - 数值操作',
        'GETRANGE - 获取子字符串',
        'SETRANGE - 设置子字符串'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建演示数据失败',
      message: error.message
    });
  }
});

// 删除字符串键
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await req.redis.del(key);
    
    res.json({
      success: true,
      message: result > 0 ? '删除成功' : '键不存在',
      key,
      deleted: result > 0
    });
  } catch (error) {
    res.status(500).json({
      error: '删除失败',
      message: error.message
    });
  }
});

module.exports = router; 