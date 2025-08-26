const express = require('express');
const router = express.Router();

// 管道操作路由 - Redis Pipeline功能

// 执行管道命令
router.post('/exec', async (req, res) => {
  try {
    const { commands } = req.body;
    
    if (!commands || !Array.isArray(commands)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'commands: [{cmd: string, args: [...]}, ...]'
      });
    }

    const startTime = Date.now();
    const pipeline = req.redis.multi();
    
    // 添加命令到管道
    commands.forEach(({ cmd, args = [] }) => {
      if (pipeline[cmd]) {
        pipeline[cmd](...args);
      } else {
        throw new Error(`不支持的Redis命令: ${cmd}`);
      }
    });

    const results = await pipeline.exec();
    const endTime = Date.now();

    res.json({
      success: true,
      message: '管道执行成功',
      commands,
      results,
      commandCount: commands.length,
      executionTime: `${endTime - startTime}ms`
    });
  } catch (error) {
    res.status(500).json({
      error: '管道执行失败',
      message: error.message
    });
  }
});

// 批量数据操作演示
router.post('/demo-batch-operations', async (req, res) => {
  try {
    const { operation = 'mixed', count = 100 } = req.body;
    
    const startTime = Date.now();
    const pipeline = req.redis.multi();
    const operations = [];

    switch (operation) {
      case 'set':
        // 批量SET操作
        for (let i = 1; i <= count; i++) {
          const key = `batch:set:${i}`;
          const value = `value_${i}_${Date.now()}`;
          pipeline.set(key, value);
          operations.push({ cmd: 'SET', key, value });
        }
        break;

      case 'hash':
        // 批量HSET操作
        for (let i = 1; i <= count; i++) {
          const key = `batch:hash:${i}`;
          const fields = {
            id: i.toString(),
            name: `item_${i}`,
            timestamp: Date.now().toString(),
            status: i % 2 === 0 ? 'active' : 'inactive'
          };
          pipeline.hSet(key, fields);
          operations.push({ cmd: 'HSET', key, fields });
        }
        break;

      case 'list':
        // 批量LPUSH操作
        for (let i = 1; i <= count; i++) {
          const key = `batch:list:${Math.ceil(i / 10)}`; // 每10个元素一个列表
          const value = `list_item_${i}`;
          pipeline.lPush(key, value);
          operations.push({ cmd: 'LPUSH', key, value });
        }
        break;

      case 'mixed':
        // 混合操作
        for (let i = 1; i <= count; i++) {
          if (i % 3 === 1) {
            // 字符串操作
            const key = `batch:mixed:str:${i}`;
            const value = `string_${i}`;
            pipeline.set(key, value);
            operations.push({ cmd: 'SET', key, value });
          } else if (i % 3 === 2) {
            // 哈希操作
            const key = `batch:mixed:hash:${i}`;
            const fields = { id: i.toString(), type: 'hash' };
            pipeline.hSet(key, fields);
            operations.push({ cmd: 'HSET', key, fields });
          } else {
            // 列表操作
            const key = 'batch:mixed:list';
            const value = `list_${i}`;
            pipeline.lPush(key, value);
            operations.push({ cmd: 'LPUSH', key, value });
          }
        }
        break;

      default:
        return res.status(400).json({
          error: '不支持的操作类型',
          supportedTypes: ['set', 'hash', 'list', 'mixed']
        });
    }

    const results = await pipeline.exec();
    const endTime = Date.now();

    res.json({
      success: true,
      message: '批量操作完成',
      operation,
      commandCount: count,
      executionTime: `${endTime - startTime}ms`,
      avgTimePerCommand: `${((endTime - startTime) / count).toFixed(2)}ms`,
      operations: operations.slice(0, 5), // 只显示前5个操作作为示例
      results: results ? results.slice(0, 5) : null // 只显示前5个结果
    });
  } catch (error) {
    res.status(500).json({
      error: '批量操作失败',
      message: error.message
    });
  }
});

// 性能对比演示
router.post('/demo-performance', async (req, res) => {
  try {
    const { commandCount = 50 } = req.body;
    
    // 准备测试数据
    const commands = [];
    for (let i = 1; i <= commandCount; i++) {
      commands.push({
        key: `perf:test:${i}`,
        value: `performance_test_value_${i}_${Date.now()}`
      });
    }

    // 方法1: 逐个执行命令
    const sequentialStart = Date.now();
    for (const { key, value } of commands) {
      await req.redis.set(key, value);
    }
    const sequentialTime = Date.now() - sequentialStart;

    // 方法2: 使用管道
    const pipelineStart = Date.now();
    const pipeline = req.redis.multi();
    commands.forEach(({ key, value }) => {
      pipeline.set(key, value);
    });
    await pipeline.exec();
    const pipelineTime = Date.now() - pipelineStart;

    // 清理测试数据
    const cleanup = req.redis.multi();
    commands.forEach(({ key }) => {
      cleanup.del(key);
    });
    await cleanup.exec();

    res.json({
      success: true,
      message: '性能对比测试完成',
      testConfig: {
        commandCount,
        operation: 'SET'
      },
      results: {
        sequential: {
          time: `${sequentialTime}ms`,
          avgPerCommand: `${(sequentialTime / commandCount).toFixed(2)}ms`
        },
        pipeline: {
          time: `${pipelineTime}ms`,
          avgPerCommand: `${(pipelineTime / commandCount).toFixed(2)}ms`
        },
        improvement: {
          speedup: `${(sequentialTime / pipelineTime).toFixed(2)}x`,
          timeSaved: `${sequentialTime - pipelineTime}ms`,
          efficiency: `${(((sequentialTime - pipelineTime) / sequentialTime) * 100).toFixed(1)}%`
        }
      },
      conclusion: pipelineTime < sequentialTime 
        ? '管道操作显著提升了性能' 
        : '在少量命令时，差异可能不明显'
    });
  } catch (error) {
    res.status(500).json({
      error: '性能测试失败',
      message: error.message
    });
  }
});

// 数据迁移演示
router.post('/demo-migration', async (req, res) => {
  try {
    const { sourcePrefix = 'old', targetPrefix = 'new', count = 20 } = req.body;
    
    // 创建源数据
    const sourceData = req.redis.multi();
    for (let i = 1; i <= count; i++) {
      sourceData.hSet(`${sourcePrefix}:user:${i}`, {
        id: i.toString(),
        name: `User${i}`,
        email: `user${i}@example.com`,
        created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    await sourceData.exec();

    // 获取所有源数据
    const migrationStart = Date.now();
    const sourceKeys = [];
    for (let i = 1; i <= count; i++) {
      sourceKeys.push(`${sourcePrefix}:user:${i}`);
    }

    // 读取源数据
    const readPipeline = req.redis.multi();
    sourceKeys.forEach(key => {
      readPipeline.hGetAll(key);
    });
    const sourceDataResults = await readPipeline.exec();

    // 迁移数据到新位置
    const migrationPipeline = req.redis.multi();
    sourceDataResults.forEach((result, index) => {
      if (result && typeof result === 'object') {
        const newKey = sourceKeys[index].replace(sourcePrefix, targetPrefix);
        const userData = result;
        userData.migrated_at = new Date().toISOString();
        userData.source_key = sourceKeys[index];
        migrationPipeline.hSet(newKey, userData);
      }
    });
    
    const migrationResults = await migrationPipeline.exec();
    const migrationTime = Date.now() - migrationStart;

    // 验证迁移结果
    const verificationPipeline = req.redis.multi();
    for (let i = 1; i <= count; i++) {
      verificationPipeline.exists(`${targetPrefix}:user:${i}`);
    }
    const verificationResults = await verificationPipeline.exec();
    const migratedCount = verificationResults.filter(result => result === 1).length;

    res.json({
      success: true,
      message: '数据迁移完成',
      migration: {
        sourcePrefix,
        targetPrefix,
        totalRecords: count,
        migratedRecords: migratedCount,
        migrationTime: `${migrationTime}ms`,
        avgTimePerRecord: `${(migrationTime / count).toFixed(2)}ms`
      },
      verification: {
        successRate: `${((migratedCount / count) * 100).toFixed(1)}%`,
        failedRecords: count - migratedCount
      },
      sampleData: {
        source: sourceDataResults[0],
        target: await req.redis.hGetAll(`${targetPrefix}:user:1`)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '数据迁移失败',
      message: error.message
    });
  }
});

// 获取管道演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建演示数据展示管道的优势
    const scenarios = {
      batchInsert: {
        description: '批量插入数据',
        example: 'POST /api/pipelines/demo-batch-operations',
        benefits: ['减少网络往返', '提高吞吐量', '降低延迟']
      },
      dataTransformation: {
        description: '数据转换和清理',
        operations: ['读取原始数据', '转换格式', '写入新位置'],
        benefits: ['原子性操作', '高效处理', '错误处理']
      },
      reporting: {
        description: '生成报表数据',
        operations: ['统计计算', '数据聚合', '结果存储'],
        benefits: ['批量处理', '性能优化', '数据一致性']
      }
    };

    // 创建一些示例统计数据
    const statsData = req.redis.multi();
    
    // 用户统计
    statsData.set('stats:users:total', '1250');
    statsData.set('stats:users:active', '980');
    statsData.set('stats:users:new_today', '45');
    
    // 订单统计
    statsData.set('stats:orders:total', '5670');
    statsData.set('stats:orders:completed', '5234');
    statsData.set('stats:orders:pending', '436');
    
    // 收入统计
    statsData.set('stats:revenue:total', '125670.50');
    statsData.set('stats:revenue:today', '3456.78');
    statsData.set('stats:revenue:month', '45678.90');

    await statsData.exec();

    // 使用管道读取所有统计数据
    const readStats = req.redis.multi();
    const statKeys = [
      'stats:users:total', 'stats:users:active', 'stats:users:new_today',
      'stats:orders:total', 'stats:orders:completed', 'stats:orders:pending',
      'stats:revenue:total', 'stats:revenue:today', 'stats:revenue:month'
    ];
    
    statKeys.forEach(key => {
      readStats.get(key);
    });
    
    const statsResults = await readStats.exec();
    
    // 组织统计结果
    const statistics = {
      users: {
        total: parseInt(statsResults[0]) || 0,
        active: parseInt(statsResults[1]) || 0,
        newToday: parseInt(statsResults[2]) || 0
      },
      orders: {
        total: parseInt(statsResults[3]) || 0,
        completed: parseInt(statsResults[4]) || 0,
        pending: parseInt(statsResults[5]) || 0
      },
      revenue: {
        total: parseFloat(statsResults[6]) || 0,
        today: parseFloat(statsResults[7]) || 0,
        month: parseFloat(statsResults[8]) || 0
      }
    };

    res.json({
      success: true,
      message: '管道演示数据',
      data: {
        scenarios,
        statistics,
        performanceMetrics: {
          description: '管道 vs 逐个执行性能对比',
          endpoint: 'POST /api/pipelines/demo-performance',
          expectedImprovement: '2-10x 性能提升'
        }
      },
      useCases: [
        '批量数据插入',
        '数据迁移和转换',
        '报表数据生成',
        '缓存预热',
        '数据清理和维护',
        '性能优化'
      ],
      advantages: [
        '减少网络往返次数',
        '提高整体吞吐量',
        '降低平均延迟',
        '更好的资源利用',
        '原子性批量操作'
      ],
      operations: [
        'MULTI - 开始管道',
        'EXEC - 执行管道',
        '支持所有Redis命令',
        '批量操作优化',
        '错误处理机制'
      ],
      bestPractices: [
        '合理控制管道大小（建议100-1000命令）',
        '避免在管道中使用阻塞命令',
        '处理执行结果和错误',
        '监控内存使用情况',
        '考虑网络带宽限制'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建管道演示数据失败',
      message: error.message
    });
  }
});

// 清理测试数据
router.delete('/cleanup', async (req, res) => {
  try {
    const { pattern = 'batch:*' } = req.query;
    
    // 获取匹配的键
    const keys = [];
    let cursor = 0;
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== 0);

    if (keys.length === 0) {
      return res.json({
        success: true,
        message: '没有找到匹配的键',
        pattern,
        deletedCount: 0
      });
    }

    // 使用管道批量删除
    const deletePipeline = req.redis.multi();
    keys.forEach(key => {
      deletePipeline.del(key);
    });
    
    const deleteResults = await deletePipeline.exec();
    const deletedCount = deleteResults.filter(result => result === 1).length;

    res.json({
      success: true,
      message: '清理完成',
      pattern,
      foundKeys: keys.length,
      deletedCount,
      cleanupTime: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      error: '清理失败',
      message: error.message
    });
  }
});

module.exports = router; 