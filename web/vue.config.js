const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true
  },
  // 配置图标
  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico'
    }
  },
  // 配置Webpack
  chainWebpack: config => {
    // 处理.ico文件
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|avif|ico)$/i)
      .set('type', 'asset')
  }
}) 