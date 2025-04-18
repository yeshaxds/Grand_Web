<template>
  <div class="code-editor-container">
    <div class="editor-header">
      <h1>在线代码编辑器</h1>
      <p>在这里编写代码，实时执行并查看结果</p>
    </div>

    <div class="editor-options">
      <div class="language-selector">
        <label for="language-select">编程语言:</label>
        <select id="language-select" v-model="selectedLanguage">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      <div class="theme-selector">
        <label for="theme-select">主题:</label>
        <select id="theme-select" v-model="editorTheme">
          <option value="vs">浅色</option>
          <option value="vs-dark">深色</option>
        </select>
      </div>
      <button class="run-button" @click="runCode" :disabled="isRunning">
        <span v-if="!isRunning">运行代码</span>
        <span v-else>执行中...</span>
      </button>
    </div>

    <div class="editor-main">
      <div class="code-section">
        <div class="section-title">代码</div>
        <MonacoEditor
          v-model="code"
          :language="selectedLanguage"
          :theme="editorTheme"
          :options="editorOptions"
          class="code-editor"
        />
      </div>
      <div class="output-section">
        <div class="section-title">执行结果</div>
        <div class="output-area" ref="outputArea">
          <template v-if="isHtmlPreview">
            <iframe ref="previewFrame" class="preview-iframe" sandbox="allow-scripts"></iframe>
          </template>
          <template v-else>
            <pre class="console-output" v-html="formattedOutput"></pre>
          </template>
        </div>
      </div>
    </div>

    <div class="examples-section">
      <h3>示例代码</h3>
      <div class="example-cards">
        <div 
          v-for="example in codeExamples" 
          :key="example.id" 
          class="example-card"
          @click="loadExample(example)"
        >
          <div class="example-language">{{ example.language }}</div>
          <div class="example-title">{{ example.title }}</div>
          <div class="example-description">{{ example.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MonacoEditor } from 'monaco-editor-vue3';
import { executeCode } from '@/services/codeExecutionService';

export default {
  name: 'CodeEditorView',
  components: {
    MonacoEditor
  },
  data() {
    return {
      code: '// 在这里编写代码\nconsole.log("Hello, World!");',
      output: '',
      isRunning: false,
      selectedLanguage: 'javascript',
      editorTheme: 'vs-dark',
      editorOptions: {
        fontSize: 14,
        tabSize: 2,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on'
      },
      codeExamples: [
        {
          id: 'js-hello',
          language: 'javascript',
          title: 'Hello World',
          description: '基本的JavaScript示例',
          code: '// 简单的Hello World示例\nconsole.log("Hello, World!");\n\n// 使用变量\nconst name = "CodeLearn用户";\nconsole.log(`欢迎, ${name}!`);\n\n// 使用函数\nfunction greet(person) {\n  return `你好, ${person}!`;\n}\n\nconsole.log(greet("编程爱好者"));'
        },
        {
          id: 'js-array',
          language: 'javascript',
          title: '数组操作',
          description: '数组方法示例',
          code: '// 数组操作示例\nconst numbers = [1, 2, 3, 4, 5];\n\n// 映射\nconst doubled = numbers.map(n => n * 2);\nconsole.log("映射后的数组:", doubled);\n\n// 过滤\nconst evenNumbers = numbers.filter(n => n % 2 === 0);\nconsole.log("过滤后的数组:", evenNumbers);\n\n// 归约\nconst sum = numbers.reduce((total, n) => total + n, 0);\nconsole.log("数组总和:", sum);'
        },
        {
          id: 'html-simple',
          language: 'html',
          title: '简单网页',
          description: 'HTML基础示例',
          code: '<!DOCTYPE html>\n<html>\n<head>\n  <title>我的测试页面</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      margin: 0;\n      padding: 20px;\n      background-color: #f5f5f5;\n    }\n    h1 {\n      color: #333;\n      text-align: center;\n    }\n    .container {\n      background: white;\n      border-radius: 8px;\n      padding: 20px;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n    }\n    button {\n      background-color: #4285f4;\n      color: white;\n      border: none;\n      padding: 10px 15px;\n      border-radius: 4px;\n      cursor: pointer;\n    }\n  </style>\n</head>\n<body>\n  <h1>欢迎使用在线编辑器</h1>\n  <div class="container">\n    <p>这是一个简单的HTML页面示例。</p>\n    <button onclick="alert(\'你点击了按钮!\')">点击我</button>\n  </div>\n</body>\n</html>'
        },
        {
          id: 'py-hello',
          language: 'python',
          title: 'Python基础',
          description: 'Python语言基础',
          code: '# Python基础示例\nprint("Hello, World!")\n\n# 使用变量\nname = "CodeLearn用户"\nprint(f"欢迎, {name}!")\n\n# 定义函数\ndef greet(person):\n    return f"你好, {person}!"\n\nprint(greet("Python爱好者"))\n\n# 列表操作\nnumbers = [1, 2, 3, 4, 5]\nprint("原始列表:", numbers)\nprint("列表元素之和:", sum(numbers))\nprint("列表元素平方:", [n**2 for n in numbers])'
        }
      ]
    };
  },
  computed: {
    formattedOutput() {
      return this.output.replace(/\n/g, '<br/>');
    },
    isHtmlPreview() {
      return this.selectedLanguage === 'html';
    }
  },
  watch: {
    selectedLanguage(newLang) {
      if (newLang === 'html' && this.code.trim() === '// 在这里编写代码\nconsole.log("Hello, World!");') {
        // 如果切换到HTML且是默认JS代码，则替换为简单的HTML模板
        this.code = '<!DOCTYPE html>\n<html>\n<head>\n  <title>我的HTML页面</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>这是我的第一个HTML页面。</p>\n</body>\n</html>';
      } else if (newLang === 'python' && this.code.trim() === '// 在这里编写代码\nconsole.log("Hello, World!");') {
        // 如果切换到Python且是默认JS代码，则替换为Python代码
        this.code = '# 在这里编写Python代码\nprint("Hello, World!")';
      } else if (newLang === 'css' && this.code.trim() === '// 在这里编写代码\nconsole.log("Hello, World!");') {
        // 如果切换到CSS且是默认JS代码，则替换为CSS代码
        this.code = '/* 在这里编写CSS样式 */\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f5f5f5;\n  color: #333;\n}\n\nh1 {\n  color: #4285f4;\n  text-align: center;\n}';
      }
    }
  },
  methods: {
    async runCode() {
      this.isRunning = true;
      this.output = '执行中...\n';

      try {
        if (this.isHtmlPreview) {
          // HTML预览处理
          this.updateHtmlPreview();
        } else {
          // 其他语言的执行
          const result = await executeCode(this.code, this.selectedLanguage);
          this.output = result;
        }
      } catch (error) {
        this.output = `执行错误: ${error.message}`;
        console.error('代码执行错误:', error);
      } finally {
        this.isRunning = false;
      }
    },
    updateHtmlPreview() {
      // 更新HTML预览iframe的内容
      const iframe = this.$refs.previewFrame;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(this.code);
        iframeDoc.close();
      }
    },
    loadExample(example) {
      this.selectedLanguage = example.language;
      this.code = example.code;
      this.output = ''; // 清空输出
    }
  },
  mounted() {
    // 页面加载后自动运行代码一次
    setTimeout(() => {
      this.runCode();
    }, 500);
  }
};
</script>

<style scoped>
.code-editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.editor-header {
  margin-bottom: 20px;
  text-align: center;
}

.editor-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 5px;
}

.editor-header p {
  color: #666;
  font-size: 1rem;
}

.editor-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.language-selector, .theme-selector {
  display: flex;
  align-items: center;
}

.language-selector label, .theme-selector label {
  margin-right: 10px;
  font-weight: bold;
  color: #555;
}

select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  font-size: 0.9rem;
}

.run-button {
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.run-button:hover {
  background-color: #3367d6;
}

.run-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.editor-main {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  height: 500px;
}

.code-section, .output-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  padding: 10px 15px;
  background-color: #4285f4;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.code-editor {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.output-area {
  flex: 1;
  padding: 15px;
  background-color: #f9f9f9;
  overflow: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.console-output {
  white-space: pre-wrap;
  margin: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
}

.examples-section {
  margin-top: 30px;
}

.examples-section h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #4285f4;
  padding-bottom: 8px;
}

.example-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.example-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.example-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.example-language {
  color: #4285f4;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.example-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.example-description {
  font-size: 0.9rem;
  color: #666;
}
</style> 