const http = require('http');

const baseUrl = 'http://localhost:8080';
let authToken = null;

// 测试API函数
function testApi(path, method = 'GET', data = null, token = null) {
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

    // 添加认证头
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

// 运行安全测试
async function runSecurityTests() {
  console.log('🔐 开始SpringSecurity测试...\n');

  try {
    // 1. 测试用户注册
    console.log('1. 测试用户注册...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    const registerResult = await testApi('/api/auth/register', 'POST', registerData);
    console.log('   状态码:', registerResult.status);
    console.log('   响应:', JSON.stringify(registerResult.data, null, 2));
    console.log('');

    // 2. 测试用户登录
    console.log('2. 测试用户登录...');
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    const loginResult = await testApi('/api/auth/login', 'POST', loginData);
    console.log('   状态码:', loginResult.status);
    console.log('   响应:', JSON.stringify(loginResult.data, null, 2));
    
    if (loginResult.status === 200 && loginResult.data.data) {
      authToken = loginResult.data.data.accessToken;
      console.log('   登录成功，获取到Token');
    }
    console.log('');

    // 3. 测试无Token访问受保护资源
    console.log('3. 测试无Token访问受保护资源...');
    const noAuthResult = await testApi('/api/users');
    console.log('   状态码:', noAuthResult.status);
    console.log('   响应:', JSON.stringify(noAuthResult.data, null, 2));
    console.log('');

    // 4. 测试有Token访问受保护资源
    if (authToken) {
      console.log('4. 测试有Token访问受保护资源...');
      const authResult = await testApi('/api/users', 'GET', null, authToken);
      console.log('   状态码:', authResult.status);
      console.log('   响应用户数量:', authResult.data.data ? authResult.data.data.length : 0);
      console.log('');

      // 5. 测试获取当前用户信息
      console.log('5. 测试获取当前用户信息...');
      const meResult = await testApi('/api/auth/me', 'GET', null, authToken);
      console.log('   状态码:', meResult.status);
      console.log('   响应:', JSON.stringify(meResult.data, null, 2));
      console.log('');

      // 6. 测试管理员权限（应该成功）
      console.log('6. 测试管理员权限...');
      const adminResult = await testApi('/api/users/admin/all', 'GET', null, authToken);
      console.log('   状态码:', adminResult.status);
      console.log('   响应:', adminResult.data.message || '请求成功');
      console.log('');

      // 7. 测试Token验证
      console.log('7. 测试Token验证...');
      const validateResult = await testApi('/api/auth/validate', 'GET', null, authToken);
      console.log('   状态码:', validateResult.status);
      console.log('   响应:', JSON.stringify(validateResult.data, null, 2));
      console.log('');
    }

    // 8. 测试普通用户登录和权限
    console.log('8. 测试普通用户登录和权限...');
    const userLoginData = {
      username: 'john_doe',
      password: 'password123'
    };
    const userLoginResult = await testApi('/api/auth/login', 'POST', userLoginData);
    console.log('   用户登录状态码:', userLoginResult.status);
    
    if (userLoginResult.status === 200 && userLoginResult.data.data) {
      const userToken = userLoginResult.data.data.accessToken;
      console.log('   普通用户登录成功');
      
      // 测试普通用户访问管理员接口（应该失败）
      const userAdminResult = await testApi('/api/users/admin/all', 'GET', null, userToken);
      console.log('   普通用户访问管理员接口状态码:', userAdminResult.status);
      console.log('   响应:', userAdminResult.data.message || '权限不足');
    }
    console.log('');

    console.log('✅ SpringSecurity测试完成！');

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
    await runSecurityTests();
  }
}

main(); 