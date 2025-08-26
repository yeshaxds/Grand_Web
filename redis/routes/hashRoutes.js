const express = require('express');
const router = express.Router();

// 哈希表操作路由 - Redis的哈希表数据类型

// 设置哈希字段
router.post('/hset', async (req, res) => {
  try {
    const { key, field, value } = req.body;
    
    if (!key || !field || value === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'field', 'value']
      });
    }

    const result = await req.redis.hSet(key, field, value);

    res.json({
      success: true,
      message: '哈希字段设置成功',
      key,
      field,
      value,
      created: result === 1
    });
  } catch (error) {
    res.status(500).json({
      error: '设置哈希字段失败',
      message: error.message
    });
  }
});

// 获取哈希字段值
router.get('/hget/:key/:field', async (req, res) => {
  try {
    const { key, field } = req.params;
    const value = await req.redis.hGet(key, field);
    
    if (value === null) {
      return res.status(404).json({
        error: '字段不存在',
        key,
        field
      });
    }

    res.json({
      success: true,
      key,
      field,
      value
    });
  } catch (error) {
    res.status(500).json({
      error: '获取哈希字段失败',
      message: error.message
    });
  }
});

// 批量设置哈希字段
router.post('/hmset', async (req, res) => {
  try {
    const { key, fields } = req.body;
    
    if (!key || !fields || typeof fields !== 'object') {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, fields: {field1: value1, field2: value2, ...}'
      });
    }

    const result = await req.redis.hSet(key, fields);

    res.json({
      success: true,
      message: '批量设置哈希字段成功',
      key,
      fields,
      fieldsSet: result
    });
  } catch (error) {
    res.status(500).json({
      error: '批量设置哈希字段失败',
      message: error.message
    });
  }
});

// 批量获取哈希字段
router.post('/hmget', async (req, res) => {
  try {
    const { key, fields } = req.body;
    
    if (!key || !fields || !Array.isArray(fields)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, fields: [field1, field2, ...]'
      });
    }

    const values = await req.redis.hmGet(key, fields);
    
    const result = fields.map((field, index) => ({
      field,
      value: values[index],
      exists: values[index] !== null
    }));

    res.json({
      success: true,
      key,
      results: result
    });
  } catch (error) {
    res.status(500).json({
      error: '批量获取哈希字段失败',
      message: error.message
    });
  }
});

// 获取所有哈希字段和值
router.get('/hgetall/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const hash = await req.redis.hGetAll(key);
    
    if (Object.keys(hash).length === 0) {
      return res.status(404).json({
        error: '哈希表不存在或为空',
        key
      });
    }

    res.json({
      success: true,
      key,
      hash,
      fieldCount: Object.keys(hash).length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取哈希表失败',
      message: error.message
    });
  }
});

// 获取所有哈希字段名
router.get('/hkeys/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const fields = await req.redis.hKeys(key);

    res.json({
      success: true,
      key,
      fields,
      count: fields.length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取哈希字段名失败',
      message: error.message
    });
  }
});

// 获取所有哈希值
router.get('/hvals/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const values = await req.redis.hVals(key);

    res.json({
      success: true,
      key,
      values,
      count: values.length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取哈希值失败',
      message: error.message
    });
  }
});

// 检查哈希字段是否存在
router.get('/hexists/:key/:field', async (req, res) => {
  try {
    const { key, field } = req.params;
    const exists = await req.redis.hExists(key, field);

    res.json({
      success: true,
      key,
      field,
      exists: exists === 1
    });
  } catch (error) {
    res.status(500).json({
      error: '检查字段存在性失败',
      message: error.message
    });
  }
});

// 获取哈希表字段数量
router.get('/hlen/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const length = await req.redis.hLen(key);

    res.json({
      success: true,
      key,
      length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取哈希表长度失败',
      message: error.message
    });
  }
});

// 哈希字段数值递增
router.post('/hincrby/:key/:field', async (req, res) => {
  try {
    const { key, field } = req.params;
    const { increment = 1 } = req.body;
    
    const newValue = await req.redis.hIncrBy(key, field, increment);

    res.json({
      success: true,
      message: '哈希字段递增成功',
      key,
      field,
      increment,
      newValue
    });
  } catch (error) {
    res.status(500).json({
      error: '哈希字段递增失败',
      message: error.message
    });
  }
});

// 删除哈希字段
router.delete('/hdel/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { fields } = req.body;
    
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'fields: [field1, field2, ...]'
      });
    }

    const deletedCount = await req.redis.hDel(key, fields);

    res.json({
      success: true,
      message: '哈希字段删除成功',
      key,
      fields,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '删除哈希字段失败',
      message: error.message
    });
  }
});

// 获取哈希演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建用户信息哈希
    const userHash = {
      id: '1001',
      username: 'redis_user',
      email: 'user@redis.com',
      age: '25',
      city: 'Shanghai',
      score: '100'
    };
    
    await req.redis.hSet('demo:user:1001', userHash);

    // 创建产品信息哈希
    const productHash = {
      id: '2001',
      name: 'Redis Book',
      price: '99.99',
      category: 'Technology',
      stock: '50',
      rating: '4.8'
    };
    
    await req.redis.hSet('demo:product:2001', productHash);

    // 创建配置信息哈希
    const configHash = {
      app_name: 'Redis Demo',
      version: '1.0.0',
      debug: 'true',
      max_connections: '1000',
      timeout: '30'
    };
    
    await req.redis.hSet('demo:config:app', configHash);

    // 获取所有演示数据
    const userInfo = await req.redis.hGetAll('demo:user:1001');
    const productInfo = await req.redis.hGetAll('demo:product:2001');
    const configInfo = await req.redis.hGetAll('demo:config:app');

    res.json({
      success: true,
      message: '哈希表演示数据',
      data: {
        user: {
          key: 'demo:user:1001',
          fields: userInfo,
          fieldCount: Object.keys(userInfo).length
        },
        product: {
          key: 'demo:product:2001',
          fields: productInfo,
          fieldCount: Object.keys(productInfo).length
        },
        config: {
          key: 'demo:config:app',
          fields: configInfo,
          fieldCount: Object.keys(configInfo).length
        }
      },
      operations: [
        'HSET - 设置哈希字段',
        'HGET - 获取哈希字段值',
        'HMSET - 批量设置字段',
        'HMGET - 批量获取字段',
        'HGETALL - 获取所有字段',
        'HKEYS - 获取所有字段名',
        'HVALS - 获取所有值',
        'HEXISTS - 检查字段存在',
        'HLEN - 获取字段数量',
        'HINCRBY - 字段数值递增',
        'HDEL - 删除字段'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建哈希演示数据失败',
      message: error.message
    });
  }
});

module.exports = router; 