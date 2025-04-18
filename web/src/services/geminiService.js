const API_KEY = 'AIzaSyC1pxQ8aq9B7esLlUY7lff-RVZXhNBfT5c';
// 主要和备用模型配置
const PRIMARY_MODEL = 'gemini-1.5-pro';
const FALLBACK_MODEL = 'gemini-pro';
const API_VERSION = 'v1';
const getApiUrl = (model) => `https://generativelanguage.googleapis.com/${API_VERSION}/models/${model}:generateContent`;

// 控制是否使用备用模型
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
 * 向Gemini API发送请求获取响应
 * @param {string} userMessage - 用户输入的消息
 * @param {Array} messageHistory - 消息历史记录（可选）
 * @returns {Promise<string>} - API响应的文本内容
 */
export async function getGeminiResponse(userMessage, messageHistory = []) {
  try {
    // 根据设置选择使用主模型或备用模型
    const modelToUse = useAlternateModel ? FALLBACK_MODEL : PRIMARY_MODEL;
    console.log(`使用模型: ${modelToUse}`);
    
    return await sendGeminiRequest(modelToUse, userMessage, messageHistory);
  } catch (error) {
    console.error(`使用${useAlternateModel ? '备用' : '主要'}模型调用Gemini API出错:`, error);
    
    // 如果当前使用主模型失败，自动尝试备用模型
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
 * 向指定的Gemini模型发送请求
 * @param {string} model - 模型名称
 * @param {string} userMessage - 用户消息
 * @param {Array} messageHistory - 消息历史
 * @returns {Promise<string>} - API响应
 */
async function sendGeminiRequest(model, userMessage, messageHistory = []) {
  // 准备请求体
  const requestBody = {
    contents: formatMessages(messageHistory, userMessage),
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  // 发送请求
  const response = await fetch(`${getApiUrl(model)}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // 解析响应
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`API调用失败 (模型: ${model}):`, data);
    throw new Error(data.error?.message || '未知错误');
  }

  if (!data.candidates || data.candidates.length === 0) {
    return '抱歉，AI未能生成有效的响应。';
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * 将消息历史记录格式化为Gemini API所需的格式
 * @param {Array} history - 消息历史记录
 * @param {string} currentMessage - 当前用户消息
 * @returns {Array} - 格式化后的消息内容数组
 */
function formatMessages(history, currentMessage) {
  const formattedMessages = [];
  
  // 添加历史消息（如果有）
  for (const msg of history) {
    formattedMessages.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }
  
  // 添加当前消息
  formattedMessages.push({
    role: 'user',
    parts: [{ text: currentMessage }]
  });
  
  return formattedMessages;
} 