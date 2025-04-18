const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

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
  },
  configureWebpack: {
    resolve: {
      alias: {
        'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor')
      }
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['javascript', 'css', 'html', 'typescript', 'json'],
        filename: 'js/[name].worker.js',
        features: [
          'accessibilityHelp', 'bracketMatching', 'caretOperations', 'clipboard',
          'colorDetector', 'comment', 'contextmenu', 'coreCommands', 'cursorUndo',
          'dnd', 'find', 'folding', 'fontZoom', 'format', 'gotoLine', 'hover',
          'inPlaceReplace', 'inspectTokens', 'linesOperations', 'links', 'multicursor',
          'parameterHints', 'quickCommand', 'quickOutline', 'referenceSearch', 'rename',
          'smartSelect', 'snippets', 'suggest', 'toggleHighContrast', 'toggleTabFocusMode',
          'transpose', 'wordHighlighter', 'wordOperations', 'wordPartOperations'
        ]
      })
    ]
  }
}) 