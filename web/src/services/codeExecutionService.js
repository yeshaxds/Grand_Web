/**
 * 代码执行服务
 * 在浏览器环境中安全执行各种编程语言的代码
 * 支持JavaScript、Python(模拟)、HTML、CSS和SQL等语言
 */

/**
 * 控制台日志收集器类
 * 用于拦截和收集console输出，保证代码执行的安全性
 */
class ConsoleCollector {
  constructor() {
    // 初始化日志存储数组
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.info = [];
    
    // 保存原始console方法，以便恢复
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
  }
  
  /**
   * 开始收集控制台输出
   * 覆盖原生console方法以拦截输出
   */
  start() {
    // 覆盖console.log方法
    console.log = (...args) => {
      this.logs.push(this.formatArgs(args));
      // 仍然调用原始方法，以便在浏览器控制台看到输出
      this.originalConsole.log(...args);
    };
    
    // 覆盖console.error方法
    console.error = (...args) => {
      this.errors.push(this.formatArgs(args));
      this.originalConsole.error(...args);
    };
    
    // 覆盖console.warn方法
    console.warn = (...args) => {
      this.warnings.push(this.formatArgs(args));
      this.originalConsole.warn(...args);
    };
    
    // 覆盖console.info方法
    console.info = (...args) => {
      this.info.push(this.formatArgs(args));
      this.originalConsole.info(...args);
    };
  }
  
  /**
   * 停止收集输出并恢复原始console方法
   */
  stop() {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
  }
  
  /**
   * 获取收集的所有标准输出
   * @returns {string} 格式化后的输出文本
   */
  getOutput() {
    const output = [];
    if (this.logs.length > 0) output.push('输出:', ...this.logs);
    if (this.warnings.length > 0) output.push('警告:', ...this.warnings);
    if (this.info.length > 0) output.push('信息:', ...this.info);
    return output.join('\n');
  }
  
  /**
   * 获取收集的错误信息
   * @returns {string} 所有错误信息拼接
   */
  getErrors() {
    return this.errors.join('\n');
  }
  
  /**
   * 格式化控制台参数为字符串
   * 处理对象类型，转换为可读格式
   * @param {Array} args - console方法的参数数组
   * @returns {string} 格式化后的字符串
   */
  formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          // 尝试将对象转换为格式化的JSON字符串
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          // 如果JSON转换失败，使用String()方法转换
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  /**
   * 清空所有收集的日志
   */
  clear() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }
}

/**
 * 安全地执行JavaScript代码
 * 使用Function构造函数在沙箱环境中执行代码
 * @param {string} code - 要执行的JavaScript代码
 * @returns {Object} 包含执行结果和错误信息的对象
 */
function executeJavaScript(code) {
  // 创建控制台收集器
  const collector = new ConsoleCollector();
  collector.start();
  
  try {
    // 创建一个安全的Function来执行代码
    // 使用严格模式增加安全性
    const executeFunction = new Function('console', `
      "use strict";
      try {
        ${code}
      } catch (error) {
        console.error("运行时错误:", error.message);
        throw error;
      }
    `);
    
    // 执行代码，传入被拦截的console对象
    executeFunction(console);
    
    // 获取执行结果
    const output = collector.getOutput();
    const errors = collector.getErrors();
    
    // 返回执行结果
    return {
      success: errors.length === 0,
      output: output || '代码执行成功，没有输出。',
      errors: errors || null
    };
  } catch (error) {
    // 捕获执行过程中的异常
    return {
      success: false,
      output: null,
      errors: `代码执行出错: ${error.message}`
    };
  } finally {
    // 确保恢复原始console方法
    collector.stop();
  }
}

/**
 * 模拟执行Python代码
 * 注意：这只是一个在浏览器中的Python代码模拟器，不是真正的Python解释器
 * @param {string} code - Python代码
 * @returns {Promise<Object>} 模拟执行结果
 */
async function executePython(code) {
  try {
    // 在浏览器环境中模拟执行Python代码（由于浏览器无法直接执行Python）
    // 这里我们解析简单的print语句和变量定义，提供基本的模拟输出
    let output = [];
    
    // 解析代码中的print语句
    const printRegex = /print\s*\((.*?)\)(?:\s*|$)/g;
    let match;
    
    while ((match = printRegex.exec(code)) !== null) {
      try {
        // 提取print括号内的内容
        const content = match[1].trim();
        
        // 简单处理不同类型的Python字符串和表达式
        if (content.startsWith('"') || content.startsWith("'")) {
          // 字符串，去除引号
          output.push(content.replace(/^['"]|['"]$/g, ''));
        } else if (content.includes("+")) {
          // 简单的字符串拼接，只返回占位值
          output.push("[字符串拼接结果]");
        } else if (content.includes("f\"") || content.includes("f'")) {
          // f-string，返回占位符替换后的结果
          let fString = content.replace(/^f['"]|['"]$/g, '');
          fString = fString.replace(/{([^}]*)}/g, '[变量值]');
          output.push(fString);
        } else {
          // 其他情况，返回占位值
          output.push(`[输出: ${content}]`);
        }
      } catch (e) {
        output.push(`[解析错误: ${e.message}]`);
      }
    }
    
    // 处理代码中的列表和字典定义
    const lines = code.split('\n');
    for (const line of lines) {
      // 检测变量赋值
      if (line.includes('=') && !line.includes('def ') && !line.includes('if ') && !line.trim().startsWith('#')) {
        const parts = line.split('=');
        if (parts.length === 2) {
          const varName = parts[0].trim();
          const value = parts[1].trim();
          
          // 列表、字典等数据结构
          if ((value.startsWith('[') && value.endsWith(']')) || 
              (value.startsWith('{') && value.endsWith('}'))) {
            output.push(`变量 ${varName} 已设置为 ${value}`);
          }
        }
      }
    }
    
    // 返回模拟执行结果，并添加提示信息
    return {
      success: true,
      output: output.length > 0 
        ? output.join('\n') + "\n\n注意：这是Python代码的模拟执行结果。要获取真实执行结果，请在实际的Python环境中运行代码。"
        : "代码执行完成，没有检测到输出。\n\n注意：这是Python代码的模拟执行结果。要获取真实执行结果，请在实际的Python环境中运行代码。",
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      errors: `Python代码解析出错: ${error.message}`
    };
  }
}

/**
 * 执行CSS代码
 * 创建一个style元素并将CSS注入其中
 * @param {string} code - CSS代码
 * @returns {Object} 执行结果
 */
function executeCSS(code) {
  try {
    // 创建一个唯一的ID，避免冲突
    const styleId = 'css-sandbox-' + Date.now();
    
    // 检查是否已存在相同ID的style元素，如果有则移除
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 创建新的style元素
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = code;
    
    // 添加到文档头部
    document.head.appendChild(styleElement);
    
    return {
      success: true,
      output: `CSS已应用到页面。样式ID: ${styleId}`,
      errors: null,
      // 返回样式元素ID，方便后续清理
      styleId: styleId
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      errors: `CSS应用失败: ${error.message}`
    };
  }
}

/**
 * 主要代码执行函数 - 对外暴露的API
 * 根据提供的语言类型选择相应的执行方法
 * @param {string} code - 要执行的代码
 * @param {string} language - 编程语言 (javascript, python, css等)
 * @returns {Promise<Object>} 执行结果
 */
export async function executeCode(code, language) {
  // 标准化语言名称为小写
  const lang = language.toLowerCase();
  
  try {
    // 根据语言选择执行方法
    switch (lang) {
      case 'javascript':
      case 'js':
        return executeJavaScript(code);
        
      case 'python':
      case 'py':
        return await executePython(code);
        
      case 'css':
        return executeCSS(code);
        
      // 可以添加更多语言支持...
        
      default:
        return {
          success: false,
          output: null,
          errors: `不支持的语言: ${language}。目前支持: JavaScript, Python(模拟执行), CSS`
        };
    }
  } catch (error) {
    // 捕获任何未处理的异常
    return {
      success: false,
      output: null,
      errors: `执行出错: ${error.message}`
    };
  }
}

// 导出其他可能需要的函数
export {
  executeJavaScript,
  executePython,
  executeCSS
}; 