<template>
  <!-- 聊天容器 - 整体聊天界面 -->
  <div class="chat-container">
    <!-- 聊天头部 - 包含标题和操作按钮 -->
    <div class="chat-header">
      <h1>AI助手对话</h1>
      <p>在这里与AI助手进行对话，获取编程问题的解答</p>
      <!-- 操作按钮区域 - 下载和清除聊天记录 -->
      <div class="chat-actions">
        <button @click="downloadChatHistory" class="download-history-button">
          <span class="download-icon">💾</span> 下载记录
        </button>
        <button @click="clearChatHistory" class="clear-history-button">
          <span class="delete-icon">🗑️</span> 清除记录
        </button>
      </div>
    </div>

    <!-- 聊天消息区域 - 显示所有对话内容 -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- 消息循环 - 遍历并显示所有聊天消息 -->
      <div v-for="(message, index) in messages" :key="index"
        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-content">
          <!-- 消息头像 -->
          <div class="message-avatar">
            <img
              :src="message.role === 'user' ? require('@/assets/user-avatar.png') : require('@/assets/assistant-avatar.png')"
              alt="Avatar" />
          </div>
          <!-- 消息文本内容 -->
          <div class="message-text">
            <div class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</div>
            <!-- 使用v-html渲染格式化后的消息内容，支持代码块等格式 -->
            <div class="message-body" v-html="formatMessageContent(message.content)"></div>
            <!-- 错误消息的重试选项 -->
            <div v-if="message.isError" class="retry-container">
              <button @click="retryLastMessage" class="retry-button">重试请求</button>
              <button @click="toggleModel" class="model-toggle-button">
                切换到{{ useAlternateModel ? '主要' : '备用' }}模型
              </button>
            </div>
          </div>
        </div>
        <!-- 消息时间戳 -->
        <div class="message-time">{{ message.time }}</div>
      </div>
      <!-- 加载中状态显示 -->
      <div v-if="isLoading" class="message assistant-message">
        <div class="message-content">
          <div class="message-avatar">
            <img :src="require('@/assets/assistant-avatar.png')" alt="Avatar" />
          </div>
          <div class="message-text">
            <div class="message-role">AI助手</div>
            <div class="message-body typing-animation">正在思考...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天输入区域 - 用户输入和发送按钮 -->
    <div class="chat-input">
      <textarea v-model="userInput" placeholder="输入你的问题..." @keyup.enter.exact="sendMessage"
        :disabled="isLoading"></textarea>
      <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
        <span v-if="!isLoading">发送</span>
        <span v-else>处理中...</span>
      </button>
    </div>
  </div>
</template>

<script>
// 导入Gemini API服务
import { getGeminiResponse, setUseAlternateModel } from '@/services/geminiService';

export default {
  name: 'ChatView',
  data() {
    return {
      // 用户输入内容
      userInput: '',
      // 是否正在加载（等待AI响应）
      isLoading: false,
      // 是否使用备用模型
      useAlternateModel: false,
      // 记录最后一条用户消息，用于重试功能
      lastUserMessage: '',
      // 消息数组，存储所有对话历史
      messages: [
        {
          role: 'assistant',
          content: '你好！我是AI编程助手，有什么编程问题我可以帮助你解答？',
          time: this.getCurrentTime(),
          isError: false
        }
      ],
      // 系统提示，用于引导AI的行为
      systemPrompt: `你是一个专业的编程助手，名字叫CodeLearn AI。你擅长回答各种编程相关问题，包括但不限于：
      - 编程语言语法和用法
      - 算法和数据结构
      - 软件架构和设计模式
      - 调试和性能优化
      - 前端和后端开发
      - 移动应用开发
      - 数据库设计和查询
      请用简洁、准确、易于理解的方式回答问题，尽量提供代码示例。如果问题不清楚，可以礼貌地请求更多信息。回答尽量使用中文。`
    }
  },
  // 组件挂载完成后的钩子
  mounted() {
    // 尝试从localStorage恢复聊天历史
    this.loadChatHistory();

    // 初始化时添加系统指令
    this.initSystemPrompt();
  },
  methods: {
    // 初始化AI系统提示 - 设置AI助手的角色和行为
    initSystemPrompt() {
      // 在初始化时，向AI发送系统提示，但不显示在UI中
      setTimeout(() => {
        this.getAIResponse(this.systemPrompt, false);
      }, 500);
    },

    // 发送用户消息
    async sendMessage() {
      // 验证输入是否有效，以及是否正在处理上一条消息
      if (!this.userInput.trim() || this.isLoading) return;

      // 添加用户消息到消息列表
      const userMessage = this.userInput.trim();
      this.lastUserMessage = userMessage; // 保存最后一条用户消息，用于重试

      this.messages.push({
        role: 'user',
        content: userMessage,
        time: this.getCurrentTime(),
        isError: false
      });

      // 清空输入框
      this.userInput = '';

      // 滚动到底部显示最新消息
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 调用AI获取响应
      await this.getAIResponse(userMessage);

      // 保存更新后的聊天历史
      this.saveChatHistory();
    },

    // 获取AI响应
    async getAIResponse(message, showInChat = true) {
      // 设置加载状态
      this.isLoading = true;

      try {
        // 设置模型选择
        setUseAlternateModel(this.useAlternateModel);

        // 获取历史消息，用于提供上下文
        const messageHistory = showInChat ? this.getMessageHistoryForAPI() : [];

        // 调用Gemini API
        const response = await getGeminiResponse(message, messageHistory);

        if (showInChat) {
          // 将AI响应添加到消息列表
          this.receiveResponse(response, false);
        }
      } catch (error) {
        console.error('获取AI响应失败:', error);
        if (showInChat) {
          // 显示错误消息
          this.receiveResponse(`抱歉，获取AI响应时出现错误：${error.message || '未知错误'}。您可以尝试重试或切换模型。`, true);
        }
      } finally {
        // 无论成功或失败，都结束加载状态
        this.isLoading = false;
      }
    },

    // 获取消息历史记录用于API调用
    getMessageHistoryForAPI() {
      // 只获取最近的10条消息作为上下文，避免超出token限制
      return this.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    },

    // 接收AI响应并添加到消息列表
    receiveResponse(response, isError = false) {
      this.messages.push({
        role: 'assistant',
        content: response,
        time: this.getCurrentTime(),
        isError: isError
      });

      // 滚动到底部显示最新消息
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 保存更新后的聊天历史
      this.saveChatHistory();
    },

    // 滚动到消息容器底部
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },

    // 获取当前时间格式化为HH:MM
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },

    // 格式化消息内容 - 处理代码块和换行符
    formatMessageContent(content) {
      // 验证内容是否存在
      if (!content) return '';

      // 替换```code```格式的代码块为HTML预格式化代码
      let formattedContent = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');

      // 替换换行符为HTML换行标签
      formattedContent = formattedContent.replace(/\n/g, '<br>');

      return formattedContent;
    },

    // 重试上一条消息 - 当AI响应失败时使用
    async retryLastMessage() {
      if (this.lastUserMessage && !this.isLoading) {
        await this.getAIResponse(this.lastUserMessage);
      }
    },

    // 切换使用备用模型
    toggleModel() {
      this.useAlternateModel = !this.useAlternateModel;
      this.receiveResponse(`已切换到${this.useAlternateModel ? '备用' : '主要'}模型。您可以重新发送消息或点击重试按钮。`, false);
    },

    // 保存聊天历史到localStorage
    saveChatHistory() {
      try {
        // 限制保存的消息数量，避免localStorage存储溢出
        const historyToSave = this.messages.slice(-50); // 只保存最近的50条消息
        localStorage.setItem('chatHistory', JSON.stringify(historyToSave));
        localStorage.setItem('chatHistoryTimestamp', new Date().toISOString());
        console.log('聊天历史已保存');
      } catch (error) {
        console.error('保存聊天历史失败:', error);
      }
    },

    // 从localStorage加载聊天历史
    loadChatHistory() {
      try {
        const savedHistory = localStorage.getItem('chatHistory');
        const timestamp = localStorage.getItem('chatHistoryTimestamp');

        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);

          // 检查历史记录是否是当天的
          const isSameDay = timestamp && new Date(timestamp).toDateString() === new Date().toDateString();

          // 如果是当天的历史记录且有内容，使用它
          if (parsedHistory && parsedHistory.length > 0 && isSameDay) {
            this.messages = parsedHistory;
            console.log('已恢复聊天历史');
          } else {
            console.log('没有当天的聊天历史或历史记录为空');
          }
        } else {
          console.log('没有找到保存的聊天历史');
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
      }
    },

    // 清除聊天历史
    clearChatHistory() {
      // 确认对话框
      if (confirm('确定要清除所有聊天记录吗？此操作不可恢复。')) {
        // 重置消息为初始欢迎消息
        this.messages = [
          {
            role: 'assistant',
            content: '你好！我是AI编程助手，有什么编程问题我可以帮助你解答？',
            time: this.getCurrentTime(),
            isError: false
          }
        ];
        // 移除localStorage中的聊天历史
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatHistoryTimestamp');
        console.log('聊天历史已清除');
      }
    },

    // 下载聊天历史为Markdown文件
    downloadChatHistory() {
      try {
        // 准备下载内容
        let content = '# CodeLearn AI 对话记录\n';
        content += `# 导出时间: ${new Date().toLocaleString()}\n\n`;

        // 添加每条消息
        this.messages.forEach(msg => {
          const role = msg.role === 'user' ? '用户' : 'AI助手';
          content += `## ${role} (${msg.time})\n\n`;
          // 移除HTML标签，保持纯文本
          const plainText = msg.content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
          content += `${plainText}\n\n`;
        });

        // 创建Blob对象
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // 设置文件名，包含日期时间
        const date = new Date();
        const filename = `CodeLearn-对话记录-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.md`;
        link.download = filename;

        // 触发下载
        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('聊天历史已下载');
      } catch (error) {
        console.error('下载聊天历史失败:', error);
        alert('下载聊天记录失败，请重试');
      }
    }
  }
}
</script>

<style scoped>
/* 代码块样式 */
:deep(.code-block) {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  margin: 10px 0;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.4;
  color: #333;
  border-left: 3px solid #42b983;
}

/* 链接样式 */
:deep(a) {
  color: #42b983;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

/* 重试功能容器样式 */
.retry-container {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

/* 重试按钮和模型切换按钮样式 */
.retry-button,
.model-toggle-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.retry-button:hover,
.model-toggle-button:hover {
  background-color: #e0e0e0;
}

.model-toggle-button {
  background-color: #e6f7ff;
  color: #1890ff;
}

.model-toggle-button:hover {
  background-color: #cceeff;
}

/* 聊天头部样式 */
.chat-header {
  text-align: center;
  margin-bottom: 20px;
}

/* 聊天操作按钮容器 */
.chat-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

/* 清除历史和下载历史按钮样式 */
.clear-history-button,
.download-history-button {
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.clear-history-button:hover {
  background-color: #ffebee;
}

.download-history-button:hover {
  background-color: #e3f2fd;
}

.delete-icon,
.download-icon {
  font-size: 1.1rem;
}

/* 输入框样式 */
.chat-input {
  display: flex;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

/* 聊天文本区域样式 */
.chat-input textarea {
  flex: 1;
  height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
}

/* 发送按钮样式 */
.chat-input button {
  width: 100px;
  margin-left: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.chat-input button:hover {
  background-color: #3aa876;
}

.chat-input button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 打字动画效果 */
.typing-animation::after {
  content: '';
  animation: typing 1.5s infinite;
}

@keyframes typing {
  0% {
    content: '';
  }

  25% {
    content: '.';
  }

  50% {
    content: '..';
  }

  75% {
    content: '...';
  }
}
</style>
