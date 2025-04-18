/**
 * 代码执行服务
 * 负责在浏览器环境中安全执行各种编程语言的代码
 */

// 安全的控制台日志收集器
class ConsoleCollector {
  constructor() {
    this.logs = [];
    this.errors = [];
    
    // 保存原始console方法
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
  }
  
  // 开始收集
  start() {
    // 覆盖console方法
    console.log = (...args) => {
      this.logs.push(this.formatArgs(args));
      this.originalConsole.log(...args);
    };
    
    console.error = (...args) => {
      this.errors.push(this.formatArgs(args));
      this.originalConsole.error(...args);
    };
    
    console.warn = (...args) => {
      this.logs.push(`[警告] ${this.formatArgs(args)}`);
      this.originalConsole.warn(...args);
    };
    
    console.info = (...args) => {
      this.logs.push(`[信息] ${this.formatArgs(args)}`);
      this.originalConsole.info(...args);
    };
  }
  
  // 停止收集并恢复原始console
  stop() {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
  }
  
  // 获取收集的输出
  getOutput() {
    return this.logs.join('\n');
  }
  
  // 获取错误信息
  getErrors() {
    return this.errors.join('\n');
  }
  
  // 格式化参数
  formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  // 清空日志
  clear() {
    this.logs = [];
    this.errors = [];
  }
}

/**
 * 安全地执行JavaScript代码
 * @param {string} code - 要执行的JavaScript代码
 * @returns {string} - 执行结果
 */
function executeJavaScript(code) {
  const collector = new ConsoleCollector();
  collector.start();
  
  try {
    // 创建一个安全的Function来执行代码
    // 使用间接eval可以在全局作用域而不是局部作用域中执行代码
    const executeFunction = new Function('console', `
      "use strict";
      try {
        ${code}
      } catch (error) {
        console.error("运行时错误:", error.message);
      }
    `);
    
    executeFunction(console);
    
    const output = collector.getOutput();
    return output || '代码执行成功，没有输出。';
  } catch (error) {
    return `代码执行出错: ${error.message}`;
  } finally {
    collector.stop();
  }
}

/**
 * 模拟执行Python代码（实际上只是格式化和提供语法高亮）
 * 注意：真正的Python执行需要服务器端支持
 * @param {string} code - Python代码
 * @returns {string} - 模拟执行结果
 */
function executePython(code) {
  try {
    // 在实际应用中，这里应该调用后端API来执行Python代码
    // 这里我们只是进行模拟输出
    
    // 解析代码中的print语句进行简单模拟
    const printRegex = /print\s*\((.*?)\)(?:\s*|$)/g;
    let match;
    let output = [];
    
    while ((match = printRegex.exec(code)) !== null) {
      try {
        // 提取print括号内的内容
        const content = match[1].trim();
        
        // 简单处理字符串和变量
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
    
    // 如果没有提取到任何输出
    if (output.length === 0) {
      return "代码执行完成，没有检测到输出。\n\n注意：这是Python代码的模拟执行结果。要获取真实执行结果，请在实际的Python环境中运行代码。";
    }
    
    return output.join('\n') + "\n\n注意：这是Python代码的模拟执行结果。要获取真实执行结果，请在实际的Python环境中运行代码。";
  } catch (error) {
    return `代码分析出错: ${error.message}\n\n注意：这是模拟执行环境，不支持完整的Python语法解析。`;
  }
}

/**
 * 执行CSS代码（返回CSS的格式化显示）
 * @param {string} code - CSS代码
 * @returns {string} - 格式化结果
 */
function executeCSS(code) {
  return "CSS代码已解析，请在HTML中使用<style>标签引入CSS以查看效果。";
}

/**
 * 执行代码（不同语言的统一入口）
 * @param {string} code - 要执行的代码
 * @param {string} language - 编程语言（javascript, python, css）
 * @returns {Promise<string>} - 执行结果
 */
export async function executeCode(code, language) {
  if (!code || code.trim() === '') {
    return '请输入代码再运行';
  }
  
  try {
    switch (language.toLowerCase()) {
      case 'javascript':
        return executeJavaScript(code);
      case 'python':
        return executePython(code);
      case 'css':
        return executeCSS(code);
      default:
        return `不支持的语言: ${language}`;
    }
  } catch (error) {
    console.error('代码执行服务错误:', error);
    return `执行出错: ${error.message}`;
  }
} 