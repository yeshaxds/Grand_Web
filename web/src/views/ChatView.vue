<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI助手对话</h1>
      <p>在这里与AI助手进行对话，获取编程问题的解答</p>
      <div class="chat-actions">
        <button @click="downloadChatHistory" class="download-history-button">
          <span class="download-icon">💾</span> 下载记录
        </button>
        <button @click="clearChatHistory" class="clear-history-button">
          <span class="delete-icon">🗑️</span> 清除记录
        </button>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-content">
          <div class="message-avatar">
            <img
              :src="message.role === 'user' ? require('@/assets/user-avatar.png') : require('@/assets/assistant-avatar.png')"
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
      <textarea v-model="userInput" placeholder="输入你的问题..." @keyup.enter.exact="sendMessage"
        :disabled="isLoading"></textarea>
      <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
        <span v-if="!isLoading">发送</span>
        <span v-else>处理中...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { getGeminiResponse, setUseAlternateModel } from '@/services/geminiService';

// 响应式数据
const userInput = ref('');
const isLoading = ref(false);
const useAlternateModel = ref(false);
const lastUserMessage = ref('');
const messagesContainer = ref(null);

// 响应式对象
const messages = reactive([
  {
    role: 'assistant',
    content: '你好！我是AI编程助手，有什么编程问题我可以帮助你解答？',
    time: getCurrentTime(),
    isError: false
  }
]);

// 系统提示，用于引导AI的行为
const systemPrompt = `你是一个专业的编程助手，名字叫CodeLearn AI。你擅长回答各种编程相关问题，包括但不限于：
- 编程语言语法和用法
- 算法和数据结构
- 软件架构和设计模式
- 调试和性能优化
- 前端和后端开发
- 移动应用开发
- 数据库设计和查询
请用简洁、准确、易于理解的方式回答问题，尽量提供代码示例。如果问题不清楚，可以礼貌地请求更多信息。回答尽量使用中文。`;

// 方法
const initSystemPrompt = () => {
  // 在初始化时，向AI发送系统提示，但不显示在UI中
  setTimeout(() => {
    getAIResponse(systemPrompt, false);
  }, 500);
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  // 添加用户消息
  const userMessage = userInput.value.trim();
  lastUserMessage.value = userMessage; // 保存最后一条用户消息，用于重试

  messages.push({
    role: 'user',
    content: userMessage,
    time: getCurrentTime(),
    isError: false
  });

  userInput.value = '';

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  // 调用AI获取响应
  await getAIResponse(userMessage);

  // 保存更新后的聊天历史
  saveChatHistory();
};

const getAIResponse = async (message, showInChat = true) => {
  isLoading.value = true;

  try {
    // 设置模型选择
    setUseAlternateModel(useAlternateModel.value);

    // 获取历史消息，用于提供上下文
    const messageHistory = showInChat ? getMessageHistoryForAPI() : [];

    // 调用Gemini API
    const response = await getGeminiResponse(message, messageHistory);

    if (showInChat) {
      // 将AI响应添加到消息列表
      receiveResponse(response, false);
    }
  } catch (error) {
    console.error('获取AI响应失败:', error);
    if (showInChat) {
      receiveResponse(`抱歉，获取AI响应时出现错误：${error.message || '未知错误'}。您可以尝试重试或切换模型。`, true);
    }
  } finally {
    isLoading.value = false;
  }
};

const getMessageHistoryForAPI = () => {
  // 只获取最近的10条消息作为上下文，避免超出token限制
  return messages.slice(-10).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

const receiveResponse = (response, isError = false) => {
  messages.push({
    role: 'assistant',
    content: response,
    time: getCurrentTime(),
    isError: isError
  });

  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });

  // 保存更新后的聊天历史
  saveChatHistory();
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const formatMessageContent = (content) => {
  // 将代码块格式化
  if (!content) return '';

  // 替换```code```格式的代码块
  let formattedContent = content.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');

  // 替换换行符为<br>
  formattedContent = formattedContent.replace(/\n/g, '<br>');

  return formattedContent;
};

// 重试上一条消息
const retryLastMessage = async () => {
  if (lastUserMessage.value && !isLoading.value) {
    await getAIResponse(lastUserMessage.value);
  }
};

// 切换使用备用模型
const toggleModel = () => {
  useAlternateModel.value = !useAlternateModel.value;
  receiveResponse(`已切换到${useAlternateModel.value ? '备用' : '主要'}模型。您可以重新发送消息或点击重试按钮。`, false);
};

// 保存聊天历史到localStorage
const saveChatHistory = () => {
  try {
    // 限制保存的消息数量，避免localStorage存储溢出
    const historyToSave = messages.slice(-50); // 只保存最近的50条消息
    localStorage.setItem('chatHistory', JSON.stringify(historyToSave));
    localStorage.setItem('chatHistoryTimestamp', new Date().toISOString());
    console.log('聊天历史已保存');
  } catch (error) {
    console.error('保存聊天历史失败:', error);
  }
};

// 从localStorage加载聊天历史
const loadChatHistory = () => {
  try {
    const savedHistory = localStorage.getItem('chatHistory');
    const timestamp = localStorage.getItem('chatHistoryTimestamp');

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);

      // 检查历史记录是否是当天的
      const isSameDay = timestamp && new Date(timestamp).toDateString() === new Date().toDateString();

      // 如果是当天的历史记录且有内容，使用它
      if (parsedHistory && parsedHistory.length > 0 && isSameDay) {
        messages.splice(0, messages.length, ...parsedHistory);
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
};

// 清除聊天历史
const clearChatHistory = () => {
  // 确认对话框
  if (confirm('确定要清除所有聊天记录吗？此操作不可恢复。')) {
    messages.splice(0, messages.length, {
      role: 'assistant',
      content: '你好！我是AI编程助手，有什么编程问题我可以帮助你解答？',
      time: getCurrentTime(),
      isError: false
    });
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatHistoryTimestamp');
    console.log('聊天历史已清除');
  }
};

// 下载聊天历史为文本文件
const downloadChatHistory = () => {
  try {
    // 准备下载内容
    let content = '# CodeLearn AI 对话记录\n';
    content += `# 导出时间: ${new Date().toLocaleString()}\n\n`;

    // 添加每条消息
    messages.forEach(msg => {
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
};

// 生命周期钩子
onMounted(() => {
  // 尝试从localStorage恢复聊天历史
  loadChatHistory();

  // 初始化时添加系统指令
  initSystemPrompt();
});
</script>

