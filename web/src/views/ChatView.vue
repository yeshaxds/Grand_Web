<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI助手对话</h1>
      <p>在这里与AI助手进行对话，获取编程问题的解答</p>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" 
          :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-content">
          <div class="message-avatar">
            <img :src="message.role === 'user' ? require('@/assets/user-avatar.png') : require('@/assets/assistant-avatar.png')" 
                 alt="Avatar" />
          </div>
          <div class="message-text">
            <div class="message-role">{{ message.role === 'user' ? '你' : 'AI助手' }}</div>
            <div class="message-body" v-html="formatMessageContent(message.content)"></div>
            <div v-if="message.isError" class="retry-container">
              <button @click="retryLastMessage" class="retry-button">重试请求</button>
              <button @click="toggleModel" class="model-toggle-button">
                切换到{{ useAlternateModel ? '主要' : '备用' }}模型
              </button>
            </div>
          </div>
        </div>
        <div class="message-time">{{ message.time }}</div>
      </div>
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
    
    <div class="chat-input">
      <textarea 
        v-model="userInput" 
        placeholder="输入你的问题..." 
        @keyup.enter.exact="sendMessage"
        :disabled="isLoading"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
        <span v-if="!isLoading">发送</span>
        <span v-else>处理中...</span>
      </button>
    </div>
  </div>
</template>

<script>
import { getGeminiResponse, setUseAlternateModel } from '@/services/geminiService';

export default {
  name: 'ChatView',
  data() {
    return {
      userInput: '',
      isLoading: false,
      useAlternateModel: false,
      lastUserMessage: '',
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
  mounted() {
    // 初始化时添加系统指令
    this.initSystemPrompt();
  },
  methods: {
    initSystemPrompt() {
      // 在初始化时，向AI发送系统提示，但不显示在UI中
      setTimeout(() => {
        this.getAIResponse(this.systemPrompt, false);
      }, 500);
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;
      
      // 添加用户消息
      const userMessage = this.userInput.trim();
      this.lastUserMessage = userMessage; // 保存最后一条用户消息，用于重试
      
      this.messages.push({
        role: 'user',
        content: userMessage,
        time: this.getCurrentTime(),
        isError: false
      });
      
      this.userInput = '';
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 调用AI获取响应
      await this.getAIResponse(userMessage);
    },
    
    async getAIResponse(message, showInChat = true) {
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
          this.receiveResponse(`抱歉，获取AI响应时出现错误：${error.message || '未知错误'}。您可以尝试重试或切换模型。`, true);
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    getMessageHistoryForAPI() {
      // 只获取最近的10条消息作为上下文，避免超出token限制
      return this.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    },
    
    receiveResponse(response, isError = false) {
      this.messages.push({
        role: 'assistant',
        content: response,
        time: this.getCurrentTime(),
        isError: isError
      });
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
    
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    
    formatMessageContent(content) {
      // 将代码块格式化
      if (!content) return '';
      
      // 替换```code```格式的代码块
      let formattedContent = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
      
      // 替换换行符为<br>
      formattedContent = formattedContent.replace(/\n/g, '<br>');
      
      return formattedContent;
    },
    
    // 重试上一条消息
    async retryLastMessage() {
      if (this.lastUserMessage && !this.isLoading) {
        await this.getAIResponse(this.lastUserMessage);
      }
    },
    
    // 切换使用备用模型
    toggleModel() {
      this.useAlternateModel = !this.useAlternateModel;
      this.receiveResponse(`已切换到${this.useAlternateModel ? '备用' : '主要'}模型。您可以重新发送消息或点击重试按钮。`, false);
    }
  }
}
</script>

<style scoped>
/* 补充样式，处理代码块显示 */
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

:deep(a) {
  color: #42b983;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

.retry-container {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.retry-button, .model-toggle-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.retry-button:hover, .model-toggle-button:hover {
  background-color: #e0e0e0;
}

.model-toggle-button {
  background-color: #e6f7ff;
  color: #1890ff;
}

.model-toggle-button:hover {
  background-color: #cceeff;
}
</style>

