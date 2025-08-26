const express = require('express');
const router = express.Router();

// 集合操作路由 - Redis的集合数据类型

// 添加成员到集合
router.post('/sadd', async (req, res) => {
  try {
    const { key, members } = req.body;
    
    if (!key || !members || !Array.isArray(members)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'key: string, members: [member1, member2, ...]'
      });
    }

    const addedCount = await req.redis.sAdd(key, members);

    res.json({
      success: true,
      message: '成员添加成功',
      key,
      members,
      addedCount,
      duplicates: members.length - addedCount
    });
  } catch (error) {
    res.status(500).json({
      error: '添加成员失败',
      message: error.message
    });
  }
});

// 获取集合所有成员
router.get('/smembers/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const members = await req.redis.sMembers(key);

    res.json({
      success: true,
      key,
      members,
      count: members.length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取集合成员失败',
      message: error.message
    });
  }
});

// 检查成员是否存在
router.get('/sismember/:key/:member', async (req, res) => {
  try {
    const { key, member } = req.params;
    const exists = await req.redis.sIsMember(key, member);

    res.json({
      success: true,
      key,
      member,
      exists: exists === 1
    });
  } catch (error) {
    res.status(500).json({
      error: '检查成员存在性失败',
      message: error.message
    });
  }
});

// 获取集合大小
router.get('/scard/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const size = await req.redis.sCard(key);

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

// 随机获取成员
router.get('/srandmember/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { count = 1 } = req.query;
    
    let members;
    if (parseInt(count) === 1) {
      members = await req.redis.sRandMember(key);
    } else {
      members = await req.redis.sRandMemberCount(key, parseInt(count));
    }

    res.json({
      success: true,
      key,
      members,
      count: Array.isArray(members) ? members.length : (members ? 1 : 0)
    });
  } catch (error) {
    res.status(500).json({
      error: '随机获取成员失败',
      message: error.message
    });
  }
});

// 移除成员
router.delete('/srem/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { members } = req.body;
    
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'members: [member1, member2, ...]'
      });
    }

    const removedCount = await req.redis.sRem(key, members);

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

// 弹出随机成员
router.post('/spop/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { count = 1 } = req.body;
    
    let popped;
    if (count === 1) {
      popped = await req.redis.sPop(key);
    } else {
      popped = await req.redis.sPopCount(key, count);
    }

    if (popped === null || (Array.isArray(popped) && popped.length === 0)) {
      return res.status(404).json({
        error: '集合为空或不存在',
        key
      });
    }

    res.json({
      success: true,
      message: '随机弹出成功',
      key,
      popped,
      count: Array.isArray(popped) ? popped.length : 1
    });
  } catch (error) {
    res.status(500).json({
      error: '随机弹出失败',
      message: error.message
    });
  }
});

// 集合交集
router.post('/sinter', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length < 2) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'keys: [key1, key2, ...] (至少2个键)'
      });
    }

    const intersection = await req.redis.sInter(keys);

    res.json({
      success: true,
      message: '集合交集计算成功',
      keys,
      intersection,
      count: intersection.length
    });
  } catch (error) {
    res.status(500).json({
      error: '计算交集失败',
      message: error.message
    });
  }
});

// 集合并集
router.post('/sunion', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length < 2) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'keys: [key1, key2, ...] (至少2个键)'
      });
    }

    const union = await req.redis.sUnion(keys);

    res.json({
      success: true,
      message: '集合并集计算成功',
      keys,
      union,
      count: union.length
    });
  } catch (error) {
    res.status(500).json({
      error: '计算并集失败',
      message: error.message
    });
  }
});

// 集合差集
router.post('/sdiff', async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length < 2) {
      return res.status(400).json({
        error: '参数格式错误',
        expected: 'keys: [key1, key2, ...] (至少2个键)'
      });
    }

    const difference = await req.redis.sDiff(keys);

    res.json({
      success: true,
      message: '集合差集计算成功',
      keys,
      difference,
      count: difference.length
    });
  } catch (error) {
    res.status(500).json({
      error: '计算差集失败',
      message: error.message
    });
  }
});

// 获取集合演示数据
router.get('/demo', async (req, res) => {
  try {
    // 创建技能标签集合
    const frontendSkills = ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'React', 'Angular'];
    const backendSkills = ['Node.js', 'Python', 'Java', 'Go', 'Redis', 'MySQL'];
    const fullstackSkills = ['JavaScript', 'Node.js', 'Vue.js', 'Express', 'MongoDB'];
    
    await req.redis.del('demo:skills:frontend', 'demo:skills:backend', 'demo:skills:fullstack');
    await req.redis.sAdd('demo:skills:frontend', frontendSkills);
    await req.redis.sAdd('demo:skills:backend', backendSkills);
    await req.redis.sAdd('demo:skills:fullstack', fullstackSkills);

    // 创建用户兴趣集合
    const user1Interests = ['编程', '音乐', '电影', '旅行', '摄影'];
    const user2Interests = ['编程', '游戏', '运动', '读书', '音乐'];
    const user3Interests = ['设计', '摄影', '旅行', '美食', '电影'];
    
    await req.redis.del('demo:interests:user1', 'demo:interests:user2', 'demo:interests:user3');
    await req.redis.sAdd('demo:interests:user1', user1Interests);
    await req.redis.sAdd('demo:interests:user2', user2Interests);
    await req.redis.sAdd('demo:interests:user3', user3Interests);

    // 获取演示数据
    const [
      frontendMembers,
      backendMembers,
      fullstackMembers,
      user1Members,
      user2Members,
      user3Members
    ] = await Promise.all([
      req.redis.sMembers('demo:skills:frontend'),
      req.redis.sMembers('demo:skills:backend'),
      req.redis.sMembers('demo:skills:fullstack'),
      req.redis.sMembers('demo:interests:user1'),
      req.redis.sMembers('demo:interests:user2'),
      req.redis.sMembers('demo:interests:user3')
    ]);

    // 计算集合运算
    const commonSkills = await req.redis.sInter(['demo:skills:frontend', 'demo:skills:backend']);
    const allSkills = await req.redis.sUnion(['demo:skills:frontend', 'demo:skills:backend']);
    const commonInterests = await req.redis.sInter(['demo:interests:user1', 'demo:interests:user2']);

    res.json({
      success: true,
      message: '集合演示数据',
      data: {
        skills: {
          frontend: {
            key: 'demo:skills:frontend',
            members: frontendMembers,
            count: frontendMembers.length,
            description: '前端技能集合'
          },
          backend: {
            key: 'demo:skills:backend',
            members: backendMembers,
            count: backendMembers.length,
            description: '后端技能集合'
          },
          fullstack: {
            key: 'demo:skills:fullstack',
            members: fullstackMembers,
            count: fullstackMembers.length,
            description: '全栈技能集合'
          }
        },
        interests: {
          user1: {
            key: 'demo:interests:user1',
            members: user1Members,
            count: user1Members.length,
            description: '用户1兴趣集合'
          },
          user2: {
            key: 'demo:interests:user2',
            members: user2Members,
            count: user2Members.length,
            description: '用户2兴趣集合'
          },
          user3: {
            key: 'demo:interests:user3',
            members: user3Members,
            count: user3Members.length,
            description: '用户3兴趣集合'
          }
        },
        operations: {
          commonSkills: {
            operation: 'SINTER frontend ∩ backend',
            result: commonSkills,
            count: commonSkills.length
          },
          allSkills: {
            operation: 'SUNION frontend ∪ backend',
            result: allSkills,
            count: allSkills.length
          },
          commonInterests: {
            operation: 'SINTER user1 ∩ user2',
            result: commonInterests,
            count: commonInterests.length
          }
        }
      },
      operations: [
        'SADD - 添加成员到集合',
        'SMEMBERS - 获取所有成员',
        'SISMEMBER - 检查成员存在',
        'SCARD - 获取集合大小',
        'SRANDMEMBER - 随机获取成员',
        'SREM - 移除成员',
        'SPOP - 弹出随机成员',
        'SINTER - 集合交集',
        'SUNION - 集合并集',
        'SDIFF - 集合差集'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: '创建集合演示数据失败',
      message: error.message
    });
  }
});

module.exports = router; 