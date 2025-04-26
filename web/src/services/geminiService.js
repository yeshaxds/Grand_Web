/**
 * Gemini AI服务模块
 * 使用Google的Gemini API提供AI对话能力
 * 支持主要模型和备用模型的切换
 */

// Google API密钥
const API_KEY = 'AIzaSyC1pxQ8aq9B7esLlUY7lff-RVZXhNBfT5c';

// 模型配置
const PRIMARY_MODEL = 'gemini-1.5-pro';     // 主要模型 - 功能更强大但可能响应更慢
const FALLBACK_MODEL = 'gemini-pro';        // 备用模型 - 功能较弱但响应更快
const API_VERSION = 'v1';                   // API版本

// 根据模型名称构建API URL
const getApiUrl = (model) => `https://generativelanguage.googleapis.com/${API_VERSION}/models/${model}:generateContent`;

// 控制是否使用备用模型的标志
let useAlternateModel = false;

/**
 * 设置是否使用备用模型
 * @param {boolean} value - 是否使用备用模型
 */
export function setUseAlternateModel(value) {
  useAlternateModel = value;
  console.log(`已设置使用${useAlternateModel ? '备用' : '主要'}模型: ${useAlternateModel ? FALLBACK_MODEL : PRIMARY_MODEL}`);
}

/**
 * 向Gemini API发送请求获取AI响应
 * @param {string} userMessage - 用户输入的消息
 * @param {Array} messageHistory - 消息历史记录，用于提供对话上下文
 * @returns {Promise<string>} - API响应的文本内容
 */
export async function getGeminiResponse(userMessage, messageHistory = []) {
  try {
    // 根据设置选择使用主模型或备用模型
    const modelToUse = useAlternateModel ? FALLBACK_MODEL : PRIMARY_MODEL;
    console.log(`使用模型: ${modelToUse}`);
    
    // 调用API获取响应
    return await sendGeminiRequest(modelToUse, userMessage, messageHistory);
  } catch (error) {
    console.error(`使用${useAlternateModel ? '备用' : '主要'}模型调用Gemini API出错:`, error);
    
    // 自动故障转移：如果主模型失败，尝试使用备用模型
    if (!useAlternateModel) {
      console.log('自动尝试使用备用模型...');
      try {
        // 尝试使用备用模型
        return await sendGeminiRequest(FALLBACK_MODEL, userMessage, messageHistory);
      } catch (fallbackError) {
        console.error('使用备用模型调用Gemini API出错:', fallbackError);
        throw fallbackError; // 向上抛出错误，让调用者处理
      }
    } else {
      // 如果已经在使用备用模型，直接向上抛出错误
      throw error;
    }
  }
}

/**
 * 向指定的Gemini模型发送API请求
 * @param {string} model - 模型名称
 * @param {string} userMessage - 用户消息
 * @param {Array} messageHistory - 消息历史
 * @returns {Promise<string>} - API响应文本
 * @private
 */
async function sendGeminiRequest(model, userMessage, messageHistory = []) {
  // 准备请求体
  const requestBody = {
    // 格式化消息内容
    contents: formatMessages(messageHistory, userMessage),
    // 生成配置
    generationConfig: {
      temperature: 0.7,         // 温度参数，控制输出的随机性
      topK: 40,                 // 考虑的最高概率标记数
      topP: 0.95,               // 控制文本生成多样性
      maxOutputTokens: 1000,    // 最大输出长度
    },
    // 安全设置
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"  // 阻止中等及以上级别的骚扰内容
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"  // 阻止中等及以上级别的仇恨言论
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"  // 阻止中等及以上级别的性内容
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"  // 阻止中等及以上级别的危险内容
      }
    ]
  };

  // 发送API请求
  const response = await fetch(`${getApiUrl(model)}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // 解析API响应
  const data = await response.json();
  
  // 处理错误
  if (!response.ok) {
    console.error(`API调用失败 (模型: ${model}):`, data);
    throw new Error(data.error?.message || '未知错误');
  }

  // 检查是否有有效响应
  if (!data.candidates || data.candidates.length === 0) {
    return '抱歉，AI未能生成有效的响应。';
  }

  // 提取文本响应并返回
  return data.candidates[0].content.parts[0].text;
}

/**
 * 将消息历史记录格式化为Gemini API所需的格式
 * @param {Array} history - 消息历史记录，包含角色和内容
 * @param {string} currentMessage - 当前用户消息
 * @returns {Array} - 格式化后的消息内容数组
 * @private
 */
function formatMessages(history, currentMessage) {
  const formattedMessages = [];
  
  // 添加历史消息（如果有）
  for (const msg of history) {
    formattedMessages.push({
      role: msg.role === 'user' ? 'user' : 'model',  // 转换角色名称以匹配API要求
      parts: [{ text: msg.content }]                 // 添加消息内容
    });
  }
  
  // 添加当前用户消息
  formattedMessages.push({
    role: 'user',
    parts: [{ text: currentMessage }]
  });
  
  return formattedMessages;
} 