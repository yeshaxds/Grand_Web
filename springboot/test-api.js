const http = require('http');

const baseUrl = 'http://localhost:8080';

// 测试API函数
function testApi(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('🚀 开始测试API...\n');

  try {
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const health = await testApi('/api/system/health');
    console.log('   状态码:', health.status);
    console.log('   响应:', JSON.stringify(health.data, null, 2));
    console.log('');

    // 测试系统信息
    console.log('2. 测试系统信息...');
    const systemInfo = await testApi('/api/system/info');
    console.log('   状态码:', systemInfo.status);
    console.log('   响应:', JSON.stringify(systemInfo.data, null, 2));
    console.log('');

    // 测试获取用户列表
    console.log('3. 测试获取用户列表...');
    const users = await testApi('/api/users');
    console.log('   状态码:', users.status);
    console.log('   响应:', JSON.stringify(users.data, null, 2));
    console.log('');

    // 测试用户统计
    console.log('4. 测试用户统计...');
    const stats = await testApi('/api/users/stats');
    console.log('   状态码:', stats.status);
    console.log('   响应:', JSON.stringify(stats.data, null, 2));
    console.log('');

    console.log('✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const health = await testApi('/api/system/health');
    if (health.status === 200) {
      console.log('✅ 服务器运行正常');
      return true;
    }
  } catch (error) {
    console.log('❌ 服务器未运行或无法连接');
    console.log('请先启动SpringBoot应用: ./mvnw spring-boot:run');
    return false;
  }
}

// 主函数
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main(); 