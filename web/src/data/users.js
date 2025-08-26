// 用户数据文件
// 保存预设的用户名和密码信息

export const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    nickname: '管理员',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    nickname: '普通用户',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 3,
    username: 'codelearn',
    password: '123456',
    nickname: 'CodeLearn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
]

// 根据用户名和密码验证用户
export function validateUser(username, password) {
  return users.find(user => user.username === username && user.password === password)
}

// 根据用户ID获取用户信息
export function getUserById(id) {
  return users.find(user => user.id === id)
} 