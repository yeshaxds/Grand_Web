const express = require('express');
const router = express.Router();

// 系统信息路由 - Redis系统管理和监控

// 获取Redis服务器信息
router.get('/info', async (req, res) => {
  try {
    const info = await req.redis.info();
    
    // 解析INFO命令返回的信息
    const sections = {};
    let currentSection = 'general';
    
    info.split('\r\n').forEach(line => {
      if (line.startsWith('# ')) {
        currentSection = line.substring(2).toLowerCase();
        sections[currentSection] = {};
      } else if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          sections[currentSection] = sections[currentSection] || {};
          sections[currentSection][key] = isNaN(value) ? value : Number(value);
        }
      }
    });

    res.json({
      success: true,
      message: 'Redis服务器信息',
      info: sections,
      rawInfo: info
    });
  } catch (error) {
    res.status(500).json({
      error: '获取服务器信息失败',
      message: error.message
    });
  }
});

// 获取Redis配置信息
router.get('/config', async (req, res) => {
  try {
    const configs = await req.redis.configGet('*');
    
    // 将数组转换为对象
    const configObj = {};
    for (let i = 0; i < configs.length; i += 2) {
      configObj[configs[i]] = configs[i + 1];
    }

    res.json({
      success: true,
      message: 'Redis配置信息',
      config: configObj,
      count: Object.keys(configObj).length
    });
  } catch (error) {
    res.status(500).json({
      error: '获取配置信息失败',
      message: error.message
    });
  }
});

// 获取数据库统计信息
router.get('/dbsize', async (req, res) => {
  try {
    const dbSize = await req.redis.dbSize();
    const info = await req.redis.info('keyspace');
    
    res.json({
      success: true,
      message: '数据库统计信息',
      totalKeys: dbSize,
      keyspaceInfo: info
    });
  } catch (error) {
    res.status(500).json({
      error: '获取数据库统计失败',
      message: error.message
    });
  }
});

// 获取所有键
router.get('/keys', async (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    
    // 使用SCAN代替KEYS以避免阻塞
    const keys = [];
    let cursor = 0;
    let scanCount = 0;
    
    do {
      const result = await req.redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 50
      });
      
      cursor = result.cursor;
      keys.push(...result.keys);
      scanCount++;
      
      // 限制扫描次数以避免无限循环
      if (scanCount > 20 || keys.length >= limit) break;
      
    } while (cursor !== 0);

    // 获取键的类型和TTL信息
    const keyDetails = await Promise.all(
      keys.slice(0, limit).map(async (key) => {
        try {
          const [type, ttl] = await Promise.all([
            req.redis.type(key),
            req.redis.ttl(key)
          ]);
          
          return {
            key,
            type,
            ttl: ttl === -1 ? 'persistent' : ttl === -2 ? 'expired' : ttl
          };
        } catch (error) {
          return {
            key,
            type: 'unknown',
            ttl: 'unknown',
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      message: '键列表信息',
      pattern,
      keys: keyDetails,
      totalFound: keys.length,
      returned: keyDetails.length,
      limited: keys.length >= limit
    });
  } catch (error) {
    res.status(500).json({
      error: '获取键列表失败',
      message: error.message
    });
  }
});

// 获取内存使用情况
router.get('/memory', async (req, res) => {
  try {
    const memoryInfo = await req.redis.info('memory');
    const memoryUsage = await req.redis.memoryUsage('');
    
    // 解析内存信息
    const memoryStats = {};
    memoryInfo.split('\r\n').forEach(line => {
      if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          memoryStats[key] = isNaN(value) ? value : Number(value);
        }
      }
    });

    res.json({
      success: true,
      message: 'Redis内存使用情况',
      memoryStats,
      serverMemoryUsage: memoryUsage,
      formattedStats: {
        usedMemory: formatBytes(memoryStats.used_memory || 0),
        usedMemoryRss: formatBytes(memoryStats.used_memory_rss || 0),
        usedMemoryPeak: formatBytes(memoryStats.used_memory_peak || 0),
        totalSystemMemory: formatBytes(memoryStats.total_system_memory || 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '获取内存信息失败',
      message: error.message
    });
  }
});

// 获取客户端连接信息
router.get('/clients', async (req, res) => {
  try {
    const clientList = await req.redis.clientList();
    const clientInfo = await req.redis.info('clients');
    
    // 解析客户端信息
    const clients = clientList.split('\n').filter(line => line.trim()).map(line => {
      const client = {};
      line.split(' ').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value !== undefined) {
          client[key] = value;
        }
      });
      return client;
    });

    res.json({
      success: true,
      message: 'Redis客户端连接信息',
      clients,
      clientCount: clients.length,
      clientInfo
    });
  } catch (error) {
    res.status(500).json({
      error: '获取客户端信息失败',
      message: error.message
    });
  }
});

// 获取命令统计
router.get('/commandstats', async (req, res) => {
  try {
    const commandStats = await req.redis.info('commandstats');
    
    // 解析命令统计
    const stats = {};
    commandStats.split('\r\n').forEach(line => {
      if (line.startsWith('cmdstat_')) {
        const [cmd, data] = line.split(':');
        const cmdName = cmd.replace('cmdstat_', '');
        const matches = data.match(/calls=(\d+),usec=(\d+),usec_per_call=([\d.]+)/);
        if (matches) {
          stats[cmdName] = {
            calls: parseInt(matches[1]),
            totalMicroseconds: parseInt(matches[2]),
            avgMicrosecondsPerCall: parseFloat(matches[3])
          };
        }
      }
    });

    // 按调用次数排序
    const sortedStats = Object.entries(stats)
      .sort(([,a], [,b]) => b.calls - a.calls)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    res.json({
      success: true,
      message: 'Redis命令统计',
      commandStats: sortedStats,
      totalCommands: Object.keys(stats).length,
      topCommands: Object.entries(sortedStats).slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({
      error: '获取命令统计失败',
      message: error.message
    });
  }
});

// 执行PING命令测试连接
router.get('/ping', async (req, res) => {
  try {
    const startTime = Date.now();
    const result = await req.redis.ping();
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      message: 'Redis连接测试',
      result,
      responseTime: `${responseTime}ms`,
      status: result === 'PONG' ? 'connected' : 'error'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Redis连接测试失败',
      message: error.message,
      status: 'disconnected'
    });
  }
});

// 获取Redis版本信息
router.get('/version', async (req, res) => {
  try {
    const info = await req.redis.info('server');
    
    const serverInfo = {};
    info.split('\r\n').forEach(line => {
      if (line.includes(':') && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          serverInfo[key] = value;
        }
      }
    });

    res.json({
      success: true,
      message: 'Redis版本信息',
      version: serverInfo.redis_version,
      serverInfo: {
        redisVersion: serverInfo.redis_version,
        redisGitSha1: serverInfo.redis_git_sha1,
        redisGitDirty: serverInfo.redis_git_dirty,
        redisBuildId: serverInfo.redis_build_id,
        redisMode: serverInfo.redis_mode,
        os: serverInfo.os,
        archBits: serverInfo.arch_bits,
        multiplexingApi: serverInfo.multiplexing_api,
        gccVersion: serverInfo.gcc_version,
        processId: serverInfo.process_id,
        runId: serverInfo.run_id,
        tcpPort: serverInfo.tcp_port,
        uptimeInSeconds: serverInfo.uptime_in_seconds,
        uptimeInDays: serverInfo.uptime_in_days
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '获取版本信息失败',
      message: error.message
    });
  }
});

// 清空数据库
router.post('/flushdb', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'YES_I_WANT_TO_DELETE_ALL_DATA') {
      return res.status(400).json({
        error: '需要确认删除',
        required: 'confirm: "YES_I_WANT_TO_DELETE_ALL_DATA"'
      });
    }

    await req.redis.flushDb();

    res.json({
      success: true,
      message: '当前数据库已清空',
      warning: '所有数据已被删除'
    });
  } catch (error) {
    res.status(500).json({
      error: '清空数据库失败',
      message: error.message
    });
  }
});

// 获取完整的系统概览
router.get('/overview', async (req, res) => {
  try {
    const [
      info,
      dbSize,
      memoryInfo,
      clientInfo
    ] = await Promise.all([
      req.redis.info(),
      req.redis.dbSize(),
      req.redis.info('memory'),
      req.redis.info('clients')
    ]);

    // 解析各种信息
    const parseInfo = (infoStr) => {
      const result = {};
      infoStr.split('\r\n').forEach(line => {
        if (line.includes(':') && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value !== undefined) {
            result[key] = isNaN(value) ? value : Number(value);
          }
        }
      });
      return result;
    };

    const serverInfo = parseInfo(info);
    const memStats = parseInfo(memoryInfo);
    const clientStats = parseInfo(clientInfo);

    res.json({
      success: true,
      message: 'Redis系统概览',
      overview: {
        server: {
          version: serverInfo.redis_version,
          mode: serverInfo.redis_mode,
          uptime: `${Math.floor(serverInfo.uptime_in_seconds / 86400)}天 ${Math.floor((serverInfo.uptime_in_seconds % 86400) / 3600)}小时`,
          port: serverInfo.tcp_port
        },
        database: {
          totalKeys: dbSize,
          keyspaceHits: serverInfo.keyspace_hits || 0,
          keyspaceMisses: serverInfo.keyspace_misses || 0,
          hitRate: serverInfo.keyspace_hits ? 
            `${((serverInfo.keyspace_hits / (serverInfo.keyspace_hits + serverInfo.keyspace_misses)) * 100).toFixed(2)}%` : 
            'N/A'
        },
        memory: {
          used: formatBytes(memStats.used_memory || 0),
          peak: formatBytes(memStats.used_memory_peak || 0),
          system: formatBytes(memStats.total_system_memory || 0)
        },
        clients: {
          connected: clientStats.connected_clients || 0,
          blocked: clientStats.blocked_clients || 0,
          maxClients: serverInfo.maxclients || 0
        },
        performance: {
          totalCommands: serverInfo.total_commands_processed || 0,
          commandsPerSecond: serverInfo.instantaneous_ops_per_sec || 0,
          totalConnections: serverInfo.total_connections_received || 0,
          rejectedConnections: serverInfo.rejected_connections || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '获取系统概览失败',
      message: error.message
    });
  }
});

// 辅助函数：格式化字节数
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = router; 