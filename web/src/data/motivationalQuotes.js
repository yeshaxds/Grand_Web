// 励志语句数据
export const motivationalQuotes = [
  {
    text: "代码是写给人看的，顺便能在机器上运行。",
    author: "Donald Knuth"
  },
  {
    text: "任何足够先进的技术都与魔法无异。",
    author: "Arthur C. Clarke"
  },
  {
    text: "先解决问题，再优化代码。",
    author: "Kent Beck"
  },
  {
    text: "简单是最终的复杂。",
    author: "Leonardo da Vinci"
  },
  {
    text: "软件正在吞噬世界。",
    author: "Marc Andreessen"
  },
  {
    text: "编程不是关于你知道什么，而是关于你能解决什么问题。",
    author: "Eric Raymond"
  },
  {
    text: "最好的程序员不仅是最有生产力的，而且知道要避免编写什么代码。",
    author: "Bill Gates"
  },
  {
    text: "衡量进度的唯一方法是可运行的代码。",
    author: "Jeff Atwood"
  },
  {
    text: "今天的工作不留到明天。",
    author: "Benjamin Franklin"
  },
  {
    text: "知识共享是学习的最快途径。",
    author: "Eric Steven Raymond"
  },
  {
    text: "复杂的东西很容易创造，简单的东西才最难。",
    author: "Martin Fowler"
  },
  {
    text: "调试是比编程本身更难的事情。",
    author: "Brian W. Kernighan"
  },
  {
    text: "没有简单的解决方案，只有聪明的选择。",
    author: "Padraic Cunningham"
  },
  {
    text: "第一步解决问题，第二步优化解决方案。",
    author: "John Johnson"
  },
  {
    text: "每天进步1%，一年后你会进步37倍。",
    author: "James Clear"
  }
];

// 获取随机励志语句
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
} 