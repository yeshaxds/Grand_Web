/**
 * 励志语录数据模块
 * 包含编程和学习相关的励志名言，用于在应用中显示
 */

// 励志语句数组，每条包含文本和作者
export const motivationalQuotes = [
  {
    text: "代码是写给人看的，顺便能在机器上运行。",
    author: "Donald Knuth" // 计算机科学家，TeX排版系统的创造者
  },
  {
    text: "任何足够先进的技术都与魔法无异。",
    author: "Arthur C. Clarke" // 科幻作家，提出了克拉克三定律
  },
  {
    text: "先解决问题，再优化代码。",
    author: "Kent Beck" // 极限编程创始人，JUnit框架创造者
  },
  {
    text: "简单是最终的复杂。",
    author: "Leonardo da Vinci" // 文艺复兴时期的艺术家和科学家
  },
  {
    text: "软件正在吞噬世界。",
    author: "Marc Andreessen" // 网景浏览器创始人，风险投资家
  },
  {
    text: "编程不是关于你知道什么，而是关于你能解决什么问题。",
    author: "Eric Raymond" // 开源软件倡导者，著有《大教堂与集市》
  },
  {
    text: "最好的程序员不仅是最有生产力的，而且知道要避免编写什么代码。",
    author: "Bill Gates" // 微软创始人
  },
  {
    text: "衡量进度的唯一方法是可运行的代码。",
    author: "Jeff Atwood" // Stack Overflow联合创始人
  },
  {
    text: "今天的工作不留到明天。",
    author: "Benjamin Franklin" // 美国开国元勋，发明家
  },
  {
    text: "知识共享是学习的最快途径。",
    author: "Eric Steven Raymond" // 开源运动领袖
  },
  {
    text: "复杂的东西很容易创造，简单的东西才最难。",
    author: "Martin Fowler" // 软件开发方法学家，重构与设计模式专家
  },
  {
    text: "调试是比编程本身更难的事情。",
    author: "Brian W. Kernighan" // C语言和Unix的创造者之一
  },
  {
    text: "没有简单的解决方案，只有聪明的选择。",
    author: "Padraic Cunningham" // 程序员和开源贡献者
  },
  {
    text: "第一步解决问题，第二步优化解决方案。",
    author: "John Johnson" // 软件工程师
  },
  {
    text: "每天进步1%，一年后你会进步37倍。",
    author: "James Clear" // 《原子习惯》作者
  }
];

/**
 * 获取随机励志语句的函数
 * @returns {Object} 包含text和author属性的对象
 */
export function getRandomQuote() {
  // 生成一个随机索引
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  // 返回该索引对应的励志语句对象
  return motivationalQuotes[randomIndex];
} 