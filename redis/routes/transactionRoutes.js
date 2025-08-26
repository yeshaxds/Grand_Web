const express = require('express');
const router = express.Router();

// 事务操作路由 - Redis事务功能

// 执行事务
router.post('/exec', async (req, res) => {
  try {
    const { commands } = req.body;
    
    if (!commands || !Array.isArray(commands)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'commands: [{cmd: string, args: [...]}, ...]'
      });
    }

    const multi = req.redis.multi();
    
    // 添加命令到事务队列
    commands.forEach(({ cmd, args = [] }) => {
      if (multi[cmd]) {
        multi[cmd](...args);
      } else {
        throw new Error(`不支持的Redis命令: ${cmd}`);
      }
    });

    const results = await multi.exec();

    res.json({
      success: true,
      message: '事务执行成功',
      commands,
      results,
      commandCount: commands.length
    });
  } catch (error) {
    res.status(500).json({
      error: '事务执行失败',
      message: error.message
    });
  }
});

// 银行转账演示事务
router.post('/demo-transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    
    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return res.status(400).json({
        error: '参数格式错误',
        required: ['fromAccount', 'toAccount', 'amount (> 0)']
      });
    }

    // 获取当前余额
    const fromBalance = parseFloat(await req.redis.get(`account:${fromAccount}:balance`) || '0');
    const toBalance = parseFloat(await req.redis.get(`account:${toAccount}:balance`) || '0');

    // 检查余额是否足够
    if (fromBalance < amount) {
      return res.status(400).json({
        error: '余额不足',
        currentBalance: fromBalance,
        requestedAmount: amount
      });
    }

    // 执行转账事务
    const multi = req.redis.multi();
    
    // 扣除转出账户余额
    multi.set(`account:${fromAccount}:balance`, (fromBalance - amount).toString());
    // 增加转入账户余额
    multi.set(`account:${toAccount}:balance`, (toBalance + amount).toString());
    // 记录转账历史
    multi.lPush(`account:${fromAccount}:history`, JSON.stringify({
      type: 'transfer_out',
      to: toAccount,
      amount,
      timestamp: Date.now(),
      balance_after: fromBalance - amount
    }));
    multi.lPush(`account:${toAccount}:history`, JSON.stringify({
      type: 'transfer_in',
      from: fromAccount,
      amount,
      timestamp: Date.now(),
      balance_after: toBalance + amount
    }));

    const results = await multi.exec();

    // 获取更新后的余额
    const newFromBalance = await req.redis.get(`account:${fromAccount}:balance`);
    const newToBalance = await req.redis.get(`account:${toAccount}:balance`);

    res.json({
      success: true,
      message: '转账成功',
      transaction: {
        from: fromAccount,
        to: toAccount,
        amount,
        timestamp: Date.now()
      },
      balances: {
        before: {
          [fromAccount]: fromBalance,
          [toAccount]: toBalance
        },
        after: {
          [fromAccount]: parseFloat(newFromBalance),
          [toAccount]: parseFloat(newToBalance)
        }
      },
      transactionResults: results
    });
  } catch (error) {
    res.status(500).json({
      error: '转账失败',
      message: error.message
    });
  }
});

// 库存扣减演示事务
router.post('/demo-inventory', async (req, res) => {
  try {
    const { productId, quantity, orderId } = req.body;
    
    if (!productId || !quantity || quantity <= 0 || !orderId) {
      return res.status(400).json({
        error: '参数格式错误',
        required: ['productId', 'quantity (> 0)', 'orderId']
      });
    }

    // 获取当前库存
    const currentStock = parseInt(await req.redis.get(`product:${productId}:stock`) || '0');
    const currentSold = parseInt(await req.redis.get(`product:${productId}:sold`) || '0');

    // 检查库存是否足够
    if (currentStock < quantity) {
      return res.status(400).json({
        error: '库存不足',
        currentStock,
        requestedQuantity: quantity
      });
    }

    // 执行库存扣减事务
    const multi = req.redis.multi();
    
    // 扣减库存
    multi.set(`product:${productId}:stock`, (currentStock - quantity).toString());
    // 增加销量
    multi.set(`product:${productId}:sold`, (currentSold + quantity).toString());
    // 记录订单
    multi.hSet(`order:${orderId}`, {
      productId,
      quantity: quantity.toString(),
      timestamp: Date.now().toString(),
      status: 'confirmed'
    });
    // 添加到销售记录
    multi.lPush(`product:${productId}:sales`, JSON.stringify({
      orderId,
      quantity,
      timestamp: Date.now(),
      stock_after: currentStock - quantity
    }));

    const results = await multi.exec();

    // 获取更新后的数据
    const newStock = await req.redis.get(`product:${productId}:stock`);
    const newSold = await req.redis.get(`product:${productId}:sold`);
    const orderInfo = await req.redis.hGetAll(`order:${orderId}`);

    res.json({
      success: true,
      message: '库存扣减成功',
      order: {
        orderId,
        productId,
        quantity,
        timestamp: Date.now()
      },
      inventory: {
        before: {
          stock: currentStock,
          sold: currentSold
        },
        after: {
          stock: parseInt(newStock),
          sold: parseInt(newSold)
        }
      },
      orderInfo,
      transactionResults: results
    });
  } catch (error) {
    res.status(500).json({
      error: '库存扣减失败',
      message: error.message
    });
  }
});

// 计数器增量演示事务
router.post('/demo-counters', async (req, res) => {
  try {
    const { counters = [] } = req.body;
    
    if (!Array.isArray(counters) || counters.length === 0) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'counters: [{name: string, increment: number}, ...]'
      });
    }

    // 获取当前值
    const currentValues = {};
    for (const counter of counters) {
      currentValues[counter.name] = parseInt(
        await req.redis.get(`counter:${counter.name}`) || '0'
      );
    }

    // 执行计数器更新事务
    const multi = req.redis.multi();
    
    counters.forEach(({ name, increment = 1 }) => {
      multi.incrBy(`counter:${name}`, increment);
      // 记录操作历史
      multi.lPush(`counter:${name}:history`, JSON.stringify({
        increment,
        timestamp: Date.now(),
        before: currentValues[name],
        after: currentValues[name] + increment
      }));
    });

    const results = await multi.exec();

    // 获取更新后的值
    const newValues = {};
    for (const counter of counters) {
      newValues[counter.name] = parseInt(
        await req.redis.get(`counter:${counter.name}`)
      );
    }

    res.json({
      success: true,
      message: '计数器更新成功',
      counters,
      values: {
        before: currentValues,
        after: newValues
      },
      transactionResults: results.slice(0, counters.length) // 只返回计数器结果
    });
  } catch (error) {
    res.status(500).json({
      error: '计数器更新失败',
      message: error.message
    });
  }
});

// 获取事务演示数据
router.get('/demo', async (req, res) => {
  try {
    // 初始化演示数据
    const initData = req.redis.multi();
    
    // 银行账户
    initData.set('account:alice:balance', '1000.00');
    initData.set('account:bob:balance', '500.00');
    initData.set('account:charlie:balance', '750.00');
    
    // 商品库存
    initData.set('product:laptop:stock', '50');
    initData.set('product:laptop:sold', '25');
    initData.set('product:phone:stock', '100');
    initData.set('product:phone:sold', '80');
    initData.set('product:tablet:stock', '30');
    initData.set('product:tablet:sold', '15');
    
    // 计数器
    initData.set('counter:page_views', '1000');
    initData.set('counter:user_registrations', '150');
    initData.set('counter:orders', '75');
    
    await initData.exec();

    // 获取当前状态
    const [
      accounts,
      products,
      counters
    ] = await Promise.all([
      // 账户信息
      Promise.all([
        req.redis.get('account:alice:balance'),
        req.redis.get('account:bob:balance'),
        req.redis.get('account:charlie:balance')
      ]).then(balances => ({
        alice: parseFloat(balances[0]),
        bob: parseFloat(balances[1]),
        charlie: parseFloat(balances[2])
      })),
      
      // 产品库存
      Promise.all([
        req.redis.mGet(['product:laptop:stock', 'product:laptop:sold']),
        req.redis.mGet(['product:phone:stock', 'product:phone:sold']),
        req.redis.mGet(['product:tablet:stock', 'product:tablet:sold'])
      ]).then(results => ({
        laptop: { stock: parseInt(results[0][0]), sold: parseInt(results[0][1]) },
        phone: { stock: parseInt(results[1][0]), sold: parseInt(results[1][1]) },
        tablet: { stock: parseInt(results[2][0]), sold: parseInt(results[2][1]) }
      })),
      
      // 计数器
      Promise.all([
        req.redis.get('counter:page_views'),
        req.redis.get('counter:user_registrations'),
        req.redis.get('counter:orders')
      ]).then(values => ({
        page_views: parseInt(values[0]),
        user_registrations: parseInt(values[1]),
        orders: parseInt(values[2])
      }))
    ]);

    res.json({
      success: true,
      message: '事务演示数据',
      data: {
        bankAccounts: {
          description: '银行账户余额',
          accounts,
          totalBalance: Object.values(accounts).reduce((sum, balance) => sum + balance, 0)
        },
        inventory: {
          description: '商品库存管理',
          products,
          totalStock: Object.values(products).reduce((sum, p) => sum + p.stock, 0),
          totalSold: Object.values(products).reduce((sum, p) => sum + p.sold, 0)
        },
        counters: {
          description: '系统计数器',
          values: counters,
          total: Object.values(counters).reduce((sum, count) => sum + count, 0)
        }
      },
      scenarios: [
        {
          name: '银行转账',
          endpoint: 'POST /api/transactions/demo-transfer',
          description: '原子性转账操作，确保资金安全',
          example: {
            fromAccount: 'alice',
            toAccount: 'bob',
            amount: 100
          }
        },
        {
          name: '库存扣减',
          endpoint: 'POST /api/transactions/demo-inventory',
          description: '原子性库存扣减，防止超卖',
          example: {
            productId: 'laptop',
            quantity: 2,
            orderId: 'ord_' + Date.now()
          }
        },
        {
          name: '计数器更新',
          endpoint: 'POST /api/transactions/demo-counters',
          description: '原子性批量计数器更新',
          example: {
            counters: [
              { name: 'page_views', increment: 10 },
              { name: 'user_registrations', increment: 1 }
            ]
          }
        }
      ],
      operations: [
        'MULTI - 开始事务',
        'EXEC - 执行事务',
        'DISCARD - 取消事务',
        'WATCH - 监视键',
        'UNWATCH - 取消监视'
      ],
      features: [
        '原子性 - 所有操作要么全部成功，要么全部失败',
        '一致性 - 事务执行前后数据保持一致',
        '隔离性 - 事务执行期间不受其他操作影响',
        '队列化 - 命令按顺序执行'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建事务演示数据失败',
      message: error.message
    });
  }
});

// 监视键演示
router.post('/demo-watch', async (req, res) => {
  try {
    const { key, expectedValue, newValue } = req.body;
    
    if (!key || expectedValue === undefined || newValue === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'expectedValue', 'newValue']
      });
    }

    // 开始监视
    await req.redis.watch(key);
    
    // 获取当前值
    const currentValue = await req.redis.get(key);
    
    if (currentValue !== expectedValue.toString()) {
      await req.redis.unwatch();
      return res.status(409).json({
        error: '键值已被修改',
        expected: expectedValue,
        current: currentValue
      });
    }

    // 执行事务
    const multi = req.redis.multi();
    multi.set(key, newValue.toString());
    const results = await multi.exec();

    if (results === null) {
      return res.status(409).json({
        error: '事务被中断，键值在执行期间被修改',
        key
      });
    }

    res.json({
      success: true,
      message: '监视键事务成功',
      key,
      expectedValue,
      newValue,
      results
    });
  } catch (error) {
    res.status(500).json({
      error: '监视键事务失败',
      message: error.message
    });
  }
});

module.exports = router; 