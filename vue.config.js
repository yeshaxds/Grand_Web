const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true
  }
}) 