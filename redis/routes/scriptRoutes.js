const express = require('express');
const router = express.Router();

// Lua脚本路由 - Redis Lua脚本功能

// 执行Lua脚本
router.post('/eval', async (req, res) => {
  try {
    const { script, keys = [], args = [] } = req.body;
    
    if (!script) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['script']
      });
    }

    const result = await req.redis.eval(script, {
      keys,
      arguments: args
    });

    res.json({
      success: true,
      message: 'Lua脚本执行成功',
      script,
      keys,
      args,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Lua脚本执行失败',
      message: error.message
    });
  }
});

// 原子性计数器脚本
router.post('/atomic-counter', async (req, res) => {
  try {
    const { key, increment = 1, max } = req.body;
    
    if (!key) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key']
      });
    }

    let script;
    let args;

    if (max !== undefined) {
      // 带最大值限制的计数器
      script = `
        local current = tonumber(redis.call('GET', KEYS[1]) or '0')
        local increment = tonumber(ARGV[1])
        local max_value = tonumber(ARGV[2])
        
        if current + increment > max_value then
          return {current, false, 'exceeded_max'}
        else
          local new_value = redis.call('INCRBY', KEYS[1], increment)
          return {new_value, true, 'success'}
        end
      `;
      args = [increment.toString(), max.toString()];
    } else {
      // 简单计数器
      script = `
        local new_value = redis.call('INCRBY', KEYS[1], ARGV[1])
        return {new_value, true, 'success'}
      `;
      args = [increment.toString()];
    }

    const result = await req.redis.eval(script, {
      keys: [key],
      arguments: args
    });

    res.json({
      success: result[1],
      message: result[2],
      key,
      increment,
      newValue: result[0],
      maxValue: max
    });
  } catch (error) {
    res.status(500).json({
      error: '原子性计数器失败',
      message: error.message
    });
  }
});

// 限流器脚本
router.post('/rate-limiter', async (req, res) => {
  try {
    const { key, limit, window = 60, identifier } = req.body;
    
    if (!key || !limit) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'limit']
      });
    }

    const script = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local identifier = ARGV[3] or 'default'
      local now = tonumber(ARGV[4])
      
      -- 滑动窗口限流
      local window_key = key .. ':' .. identifier .. ':' .. math.floor(now / window)
      local current = tonumber(redis.call('GET', window_key) or '0')
      
      if current >= limit then
        local ttl = redis.call('TTL', window_key)
        return {false, current, limit, ttl > 0 and ttl or window}
      else
        local new_count = redis.call('INCR', window_key)
        if new_count == 1 then
          redis.call('EXPIRE', window_key, window)
        end
        return {true, new_count, limit, window}
      end
    `;

    const result = await req.redis.eval(script, {
      keys: [key],
      arguments: [
        limit.toString(),
        window.toString(),
        identifier || 'default',
        Date.now().toString()
      ]
    });

    res.json({
      success: true,
      allowed: result[0],
      currentCount: result[1],
      limit: result[2],
      resetTime: result[3],
      key,
      identifier: identifier || 'default'
    });
  } catch (error) {
    res.status(500).json({
      error: '限流器执行失败',
      message: error.message
    });
  }
});

// 分布式锁脚本
router.post('/distributed-lock', async (req, res) => {
  try {
    const { action, lockKey, identifier, ttl = 30 } = req.body;
    
    if (!action || !lockKey || !identifier) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['action (acquire/release)', 'lockKey', 'identifier']
      });
    }

    let script;
    let args;

    if (action === 'acquire') {
      // 获取锁
      script = `
        local lock_key = KEYS[1]
        local identifier = ARGV[1]
        local ttl = tonumber(ARGV[2])
        
        local current = redis.call('GET', lock_key)
        if current == false then
          -- 锁不存在，获取锁
          redis.call('SET', lock_key, identifier, 'EX', ttl)
          return {true, 'acquired', ttl}
        elseif current == identifier then
          -- 已经持有锁，续期
          redis.call('EXPIRE', lock_key, ttl)
          return {true, 'renewed', ttl}
        else
          -- 锁被其他进程持有
          local remaining_ttl = redis.call('TTL', lock_key)
          return {false, 'locked_by_other', remaining_ttl}
        end
      `;
      args = [identifier, ttl.toString()];
    } else if (action === 'release') {
      // 释放锁
      script = `
        local lock_key = KEYS[1]
        local identifier = ARGV[1]
        
        local current = redis.call('GET', lock_key)
        if current == identifier then
          redis.call('DEL', lock_key)
          return {true, 'released', 0}
        elseif current == false then
          return {false, 'not_found', 0}
        else
          return {false, 'not_owner', redis.call('TTL', lock_key)}
        end
      `;
      args = [identifier];
    } else {
      return res.status(400).json({
        error: '无效的操作',
        validActions: ['acquire', 'release']
      });
    }

    const result = await req.redis.eval(script, {
      keys: [lockKey],
      arguments: args
    });

    res.json({
      success: result[0],
      action,
      lockKey,
      identifier,
      status: result[1],
      ttl: result[2]
    });
  } catch (error) {
    res.status(500).json({
      error: '分布式锁操作失败',
      message: error.message
    });
  }
});

// 原子性库存扣减脚本
router.post('/atomic-inventory', async (req, res) => {
  try {
    const { productId, quantity, orderId } = req.body;
    
    if (!productId || !quantity || !orderId || quantity <= 0) {
      return res.status(400).json({
        error: '参数格式错误',
        required: ['productId', 'quantity (> 0)', 'orderId']
      });
    }

    const script = `
      local stock_key = 'product:' .. ARGV[1] .. ':stock'
      local sold_key = 'product:' .. ARGV[1] .. ':sold'
      local order_key = 'order:' .. ARGV[3]
      local quantity = tonumber(ARGV[2])
      local product_id = ARGV[1]
      local order_id = ARGV[3]
      local timestamp = ARGV[4]
      
      -- 获取当前库存
      local current_stock = tonumber(redis.call('GET', stock_key) or '0')
      local current_sold = tonumber(redis.call('GET', sold_key) or '0')
      
      -- 检查库存是否足够
      if current_stock < quantity then
        return {false, 'insufficient_stock', current_stock, 0, 0}
      end
      
      -- 原子性扣减库存
      local new_stock = redis.call('DECRBY', stock_key, quantity)
      local new_sold = redis.call('INCRBY', sold_key, quantity)
      
      -- 创建订单记录
      redis.call('HMSET', order_key,
        'productId', product_id,
        'quantity', quantity,
        'timestamp', timestamp,
        'status', 'confirmed',
        'stock_before', current_stock,
        'stock_after', new_stock
      )
      
      -- 记录销售历史
      local sale_record = cjson.encode({
        orderId = order_id,
        quantity = quantity,
        timestamp = tonumber(timestamp),
        stock_after = new_stock
      })
      redis.call('LPUSH', 'product:' .. product_id .. ':sales', sale_record)
      
      return {true, 'success', new_stock, new_sold, current_stock}
    `;

    const result = await req.redis.eval(script, {
      keys: [],
      arguments: [
        productId,
        quantity.toString(),
        orderId,
        Date.now().toString()
      ]
    });

    if (result[0]) {
      res.json({
        success: true,
        message: '库存扣减成功',
        productId,
        orderId,
        quantity,
        inventory: {
          before: {
            stock: result[4],
            sold: result[3] - quantity
          },
          after: {
            stock: result[2],
            sold: result[3]
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result[1],
        productId,
        currentStock: result[2],
        requestedQuantity: quantity
      });
    }
  } catch (error) {
    res.status(500).json({
      error: '原子性库存扣减失败',
      message: error.message
    });
  }
});

// 批量操作脚本
router.post('/batch-operations', async (req, res) => {
  try {
    const { operations } = req.body;
    
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'operations: [{type: "set|get|incr|del", key: string, value?: any}, ...]'
      });
    }

    const script = `
      local results = {}
      local ops = cjson.decode(ARGV[1])
      
      for i, op in ipairs(ops) do
        local result
        if op.type == 'set' then
          result = redis.call('SET', op.key, op.value)
        elseif op.type == 'get' then
          result = redis.call('GET', op.key)
        elseif op.type == 'incr' then
          result = redis.call('INCRBY', op.key, tonumber(op.value) or 1)
        elseif op.type == 'del' then
          result = redis.call('DEL', op.key)
        else
          result = 'unsupported_operation'
        end
        
        table.insert(results, {
          operation = op,
          result = result,
          success = result ~= 'unsupported_operation'
        })
      end
      
      return cjson.encode(results)
    `;

    const result = await req.redis.eval(script, {
      keys: [],
      arguments: [JSON.stringify(operations)]
    });

    const parsedResults = JSON.parse(result);

    res.json({
      success: true,
      message: '批量操作完成',
      operationCount: operations.length,
      results: parsedResults
    });
  } catch (error) {
    res.status(500).json({
      error: '批量操作失败',
      message: error.message
    });
  }
});

// 获取Lua脚本演示数据
router.get('/demo', async (req, res) => {
  try {
    // 初始化演示数据
    const initScript = `
      -- 初始化产品库存
      redis.call('SET', 'product:laptop:stock', '100')
      redis.call('SET', 'product:laptop:sold', '50')
      redis.call('SET', 'product:phone:stock', '200')
      redis.call('SET', 'product:phone:sold', '80')
      
      -- 初始化计数器
      redis.call('SET', 'counter:page_views', '1000')
      redis.call('SET', 'counter:api_calls', '5000')
      
      -- 初始化限流数据
      redis.call('SET', 'rate_limit:api:user123:' .. math.floor(os.time() / 60), '5')
      redis.call('EXPIRE', 'rate_limit:api:user123:' .. math.floor(os.time() / 60), 60)
      
      return 'initialized'
    `;

    await req.redis.eval(initScript, { keys: [], arguments: [] });

    // 获取当前状态
    const statusScript = `
      local status = {}
      
      -- 产品库存状态
      status.inventory = {
        laptop = {
          stock = tonumber(redis.call('GET', 'product:laptop:stock') or '0'),
          sold = tonumber(redis.call('GET', 'product:laptop:sold') or '0')
        },
        phone = {
          stock = tonumber(redis.call('GET', 'product:phone:stock') or '0'),
          sold = tonumber(redis.call('GET', 'product:phone:sold') or '0')
        }
      }
      
      -- 计数器状态
      status.counters = {
        page_views = tonumber(redis.call('GET', 'counter:page_views') or '0'),
        api_calls = tonumber(redis.call('GET', 'counter:api_calls') or '0')
      }
      
      -- 限流状态
      local rate_key = 'rate_limit:api:user123:' .. math.floor(os.time() / 60)
      status.rate_limit = {
        current = tonumber(redis.call('GET', rate_key) or '0'),
        ttl = redis.call('TTL', rate_key)
      }
      
      return cjson.encode(status)
    `;

    const statusResult = await req.redis.eval(statusScript, { keys: [], arguments: [] });
    const currentStatus = JSON.parse(statusResult);

    res.json({
      success: true,
      message: 'Lua脚本演示数据',
      data: {
        currentStatus,
        scriptExamples: [
          {
            name: '原子性计数器',
            endpoint: 'POST /api/scripts/atomic-counter',
            description: '带最大值限制的原子性计数器',
            example: {
              key: 'counter:page_views',
              increment: 10,
              max: 10000
            }
          },
          {
            name: '限流器',
            endpoint: 'POST /api/scripts/rate-limiter',
            description: '滑动窗口限流器',
            example: {
              key: 'rate_limit:api',
              limit: 100,
              window: 60,
              identifier: 'user123'
            }
          },
          {
            name: '分布式锁',
            endpoint: 'POST /api/scripts/distributed-lock',
            description: '基于Redis的分布式锁',
            example: {
              action: 'acquire',
              lockKey: 'lock:resource:123',
              identifier: 'process_' + Date.now(),
              ttl: 30
            }
          },
          {
            name: '原子性库存扣减',
            endpoint: 'POST /api/scripts/atomic-inventory',
            description: '防止超卖的原子性库存操作',
            example: {
              productId: 'laptop',
              quantity: 2,
              orderId: 'ord_' + Date.now()
            }
          }
        ]
      },
      advantages: [
        '原子性操作 - 脚本作为单个原子操作执行',
        '减少网络往返 - 复杂逻辑在服务器端执行',
        '数据一致性 - 避免竞态条件',
        '性能优化 - 减少客户端与服务器的交互',
        '复杂逻辑 - 支持条件判断和循环'
      ],
      useCases: [
        '分布式锁实现',
        '限流和防刷',
        '原子性计数器',
        '库存管理',
        '批量数据处理',
        '复杂的数据验证'
      ],
      bestPractices: [
        '保持脚本简洁，避免长时间运行',
        '使用局部变量减少内存占用',
        '合理使用键名模式',
        '处理异常情况',
        '考虑脚本的可重入性'
      ],
      luaFunctions: [
        'redis.call() - 执行Redis命令',
        'cjson.encode/decode - JSON处理',
        'tonumber() - 类型转换',
        'table.insert() - 数组操作',
        'math.floor() - 数学函数'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建Lua脚本演示数据失败',
      message: error.message
    });
  }
});

// 脚本性能测试
router.post('/performance-test', async (req, res) => {
  try {
    const { testType = 'counter', iterations = 100 } = req.body;
    
    let script;
    let description;

    switch (testType) {
      case 'counter':
        script = `
          local key = KEYS[1]
          local iterations = tonumber(ARGV[1])
          local results = {}
          
          for i = 1, iterations do
            local new_value = redis.call('INCR', key)
            table.insert(results, new_value)
          end
          
          return {#results, results[#results]}
        `;
        description = '批量计数器递增测试';
        break;

      case 'batch_set':
        script = `
          local prefix = ARGV[1]
          local iterations = tonumber(ARGV[2])
          local success_count = 0
          
          for i = 1, iterations do
            local key = prefix .. ':' .. i
            local value = 'test_value_' .. i
            redis.call('SET', key, value)
            success_count = success_count + 1
          end
          
          return {success_count, iterations}
        `;
        description = '批量SET操作测试';
        break;

      default:
        return res.status(400).json({
          error: '不支持的测试类型',
          supportedTypes: ['counter', 'batch_set']
        });
    }

    const startTime = Date.now();
    
    let result;
    if (testType === 'counter') {
      result = await req.redis.eval(script, {
        keys: [`perf_test:${testType}:${Date.now()}`],
        arguments: [iterations.toString()]
      });
    } else {
      result = await req.redis.eval(script, {
        keys: [],
        arguments: [`perf_test:${testType}:${Date.now()}`, iterations.toString()]
      });
    }
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    res.json({
      success: true,
      message: '性能测试完成',
      testType,
      description,
      iterations,
      executionTime: `${executionTime}ms`,
      avgTimePerOperation: `${(executionTime / iterations).toFixed(3)}ms`,
      operationsPerSecond: Math.round(iterations / (executionTime / 1000)),
      result: {
        processed: result[0],
        finalValue: result[1]
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '性能测试失败',
      message: error.message
    });
  }
});

module.exports = router; 