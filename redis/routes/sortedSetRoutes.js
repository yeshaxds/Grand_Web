const express = require('express');
const router = express.Router();

// 有序集合操作路由 - Redis的有序集合数据类型

// 添加成员到有序集合
router.post('/zadd', async (req, res) => {
  try {
    const { key, members } = req.body;
    
    if (!key || !members || !Array.isArray(members)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, members: [{score: number, value: string}, ...]'
      });
    }

    // 转换为Redis ZADD格式
    const scoreValuePairs = [];
    members.forEach(member => {
      if (typeof member.score === 'number' && member.value !== undefined) {
        scoreValuePairs.push({ score: member.score, value: member.value });
      }
    });

    if (scoreValuePairs.length === 0) {
      return res.status(400).json({
        error: '无有效的分数-值对',
        expected: 'members: [{score: number, value: string}, ...]'
      });
    }

    const addedCount = await req.redis.zAdd(key, scoreValuePairs);

    res.json({
      success: true,
      message: '成员添加成功',
      key,
      members: scoreValuePairs,
      addedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '添加成员失败',
      message: error.message
    });
  }
});

// 获取指定范围的成员（按分数排序）
router.get('/zrange/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { start = 0, stop = -1, withScores = 'false' } = req.query;
    
    let members;
    if (withScores.toLowerCase() === 'true') {
      members = await req.redis.zRangeWithScores(key, parseInt(start), parseInt(stop));
    } else {
      members = await req.redis.zRange(key, parseInt(start), parseInt(stop));
    }

    res.json({
      success: true,
      key,
      members,
      count: Array.isArray(members) ? members.length : 0,
      range: {
        start: parseInt(start),
        stop: parseInt(stop)
      },
      withScores: withScores.toLowerCase() === 'true'
    });
  } catch (error) {
    res.status(500).json({
      error: '获取范围成员失败',
      message: error.message
    });
  }
});

// 获取指定分数范围的成员
router.get('/zrangebyscore/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { min, max, withScores = 'false', limit } = req.query;
    
    if (min === undefined || max === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['min', 'max']
      });
    }

    const options = {};
    if (limit) {
      const [offset, count] = limit.split(',').map(Number);
      options.LIMIT = { offset, count };
    }

    let members;
    if (withScores.toLowerCase() === 'true') {
      members = await req.redis.zRangeByScoreWithScores(key, parseFloat(min), parseFloat(max), options);
    } else {
      members = await req.redis.zRangeByScore(key, parseFloat(min), parseFloat(max), options);
    }

    res.json({
      success: true,
      key,
      members,
      count: Array.isArray(members) ? members.length : 0,
      scoreRange: {
        min: parseFloat(min),
        max: parseFloat(max)
      },
      withScores: withScores.toLowerCase() === 'true'
    });
  } catch (error) {
    res.status(500).json({
      error: '按分数获取成员失败',
      message: error.message
    });
  }
});

// 获取成员的分数
router.get('/zscore/:key/:member', async (req, res) => {
  try {
    const { key, member } = req.params;
    const score = await req.redis.zScore(key, member);
    
    if (score === null) {
      return res.status(404).json({
        error: '成员不存在',
        key,
        member
      });
    }

    res.json({
      success: true,
      key,
      member,
      score
    });
  } catch (error) {
    res.status(500).json({
      error: '获取成员分数失败',
      message: error.message
    });
  }
});

// 获取成员的排名
router.get('/zrank/:key/:member', async (req, res) => {
  try {
    const { key, member } = req.params;
    const rank = await req.redis.zRank(key, member);
    
    if (rank === null) {
      return res.status(404).json({
        error: '成员不存在',
        key,
        member
      });
    }

    res.json({
      success: true,
      key,
      member,
      rank,
      position: rank + 1 // 排名从1开始
    });
  } catch (error) {
    res.status(500).json({
      error: '获取成员排名失败',
      message: error.message
    });
  }
});

// 获取有序集合大小
router.get('/zcard/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const size = await req.redis.zCard(key);

    res.json({
      success: true,
      key,
      size
    });
  } catch (error) {
    res.status(500).json({
      error: '获取集合大小失败',
      message: error.message
    });
  }
});

// 获取指定分数范围内的成员数量
router.get('/zcount/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { min, max } = req.query;
    
    if (min === undefined || max === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['min', 'max']
      });
    }

    const count = await req.redis.zCount(key, parseFloat(min), parseFloat(max));

    res.json({
      success: true,
      key,
      count,
      scoreRange: {
        min: parseFloat(min),
        max: parseFloat(max)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '统计成员数量失败',
      message: error.message
    });
  }
});

// 增加成员的分数
router.post('/zincrby/:key/:member', async (req, res) => {
  try {
    const { key, member } = req.params;
    const { increment } = req.body;
    
    if (increment === undefined || typeof increment !== 'number') {
      return res.status(400).json({
        error: '缺少必要参数',
        required: 'increment: number'
      });
    }

    const newScore = await req.redis.zIncrBy(key, increment, member);

    res.json({
      success: true,
      message: '分数增加成功',
      key,
      member,
      increment,
      newScore
    });
  } catch (error) {
    res.status(500).json({
      error: '增加分数失败',
      message: error.message
    });
  }
});

// 移除成员
router.delete('/zrem/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { members } = req.body;
    
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'members: [member1, member2, ...]'
      });
    }

    const removedCount = await req.redis.zRem(key, members);

    res.json({
      success: true,
      message: '成员移除成功',
      key,
      members,
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '移除成员失败',
      message: error.message
    });
  }
});

// 按排名移除成员
router.post('/zremrangebyrank', async (req, res) => {
  try {
    const { key, start, stop } = req.body;
    
    if (!key || start === undefined || stop === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'start', 'stop']
      });
    }

    const removedCount = await req.redis.zRemRangeByRank(key, start, stop);

    res.json({
      success: true,
      message: '按排名移除成功',
      key,
      range: { start, stop },
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '按排名移除失败',
      message: error.message
    });
  }
});

// 按分数移除成员
router.post('/zremrangebyscore', async (req, res) => {
  try {
    const { key, min, max } = req.body;
    
    if (!key || min === undefined || max === undefined) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['key', 'min', 'max']
      });
    }

    const removedCount = await req.redis.zRemRangeByScore(key, min, max);

    res.json({
      success: true,
      message: '按分数移除成功',
      key,
      scoreRange: { min, max },
      removedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '按分数移除失败',
      message: error.message
    });
  }
});

// 获取有序集合演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建游戏排行榜
    const gameScores = [
      { score: 9500, value: 'Player1' },
      { score: 8800, value: 'Player2' },
      { score: 8200, value: 'Player3' },
      { score: 7900, value: 'Player4' },
      { score: 7500, value: 'Player5' },
      { score: 7200, value: 'Player6' },
      { score: 6800, value: 'Player7' },
      { score: 6500, value: 'Player8' },
      { score: 6200, value: 'Player9' },
      { score: 5900, value: 'Player10' }
    ];
    
    await req.redis.del('demo:game:leaderboard');
    await req.redis.zAdd('demo:game:leaderboard', gameScores);

    // 创建商品销量排行
    const productSales = [
      { score: 1250, value: 'iPhone 15' },
      { score: 980, value: 'MacBook Pro' },
      { score: 850, value: 'iPad Air' },
      { score: 720, value: 'AirPods Pro' },
      { score: 650, value: 'Apple Watch' },
      { score: 580, value: 'Mac Mini' },
      { score: 420, value: 'Apple TV' },
      { score: 380, value: 'HomePod' }
    ];
    
    await req.redis.del('demo:product:sales');
    await req.redis.zAdd('demo:product:sales', productSales);

    // 创建学生成绩排名
    const studentGrades = [
      { score: 98.5, value: '张三' },
      { score: 96.8, value: '李四' },
      { score: 95.2, value: '王五' },
      { score: 93.7, value: '赵六' },
      { score: 91.5, value: '陈七' },
      { score: 89.3, value: '刘八' },
      { score: 87.9, value: '杨九' },
      { score: 85.6, value: '周十' }
    ];
    
    await req.redis.del('demo:student:grades');
    await req.redis.zAdd('demo:student:grades', studentGrades);

    // 获取演示数据
    const [
      gameLeaderboard,
      productRanking,
      gradeRanking
    ] = await Promise.all([
      req.redis.zRevRangeWithScores('demo:game:leaderboard', 0, -1),
      req.redis.zRevRangeWithScores('demo:product:sales', 0, -1),
      req.redis.zRevRangeWithScores('demo:student:grades', 0, -1)
    ]);

    // 获取一些统计信息
    const [
      topGamers,
      topProducts,
      excellentStudents
    ] = await Promise.all([
      req.redis.zRevRangeWithScores('demo:game:leaderboard', 0, 2),
      req.redis.zRangeByScoreWithScores('demo:product:sales', 600, '+inf'),
      req.redis.zRangeByScoreWithScores('demo:student:grades', 90, 100)
    ]);

    res.json({
      success: true,
      message: '有序集合演示数据',
      data: {
        gameLeaderboard: {
          key: 'demo:game:leaderboard',
          members: gameLeaderboard,
          count: gameLeaderboard.length,
          description: '游戏排行榜 - 按分数降序'
        },
        productSales: {
          key: 'demo:product:sales',
          members: productRanking,
          count: productRanking.length,
          description: '商品销量排行 - 按销量降序'
        },
        studentGrades: {
          key: 'demo:student:grades',
          members: gradeRanking,
          count: gradeRanking.length,
          description: '学生成绩排名 - 按分数降序'
        }
      },
      analytics: {
        topGamers: {
          description: '前3名玩家',
          members: topGamers
        },
        topProducts: {
          description: '销量超过600的商品',
          members: topProducts,
          count: topProducts.length
        },
        excellentStudents: {
          description: '90分以上的学生',
          members: excellentStudents,
          count: excellentStudents.length
        }
      },
      operations: [
        'ZADD - 添加成员和分数',
        'ZRANGE - 按排名获取成员',
        'ZRANGEBYSCORE - 按分数范围获取',
        'ZSCORE - 获取成员分数',
        'ZRANK - 获取成员排名',
        'ZCARD - 获取集合大小',
        'ZCOUNT - 统计分数范围内成员',
        'ZINCRBY - 增加成员分数',
        'ZREM - 移除成员',
        'ZREMRANGEBYRANK - 按排名移除',
        'ZREMRANGEBYSCORE - 按分数移除'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建有序集合演示数据失败',
      message: error.message
    });
  }
});

module.exports = router; 