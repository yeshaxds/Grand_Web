<template>
  <div class="stack-detail" v-if="stack">
    <div class="header">
      <div class="stack-icon">{{ stack.icon }}</div>
      <div class="header-content">
        <h1>{{ stack.name }}</h1>
        <div class="stack-tags">
          <span v-for="tag in stack.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="main-content">
        <section class="overview">
          <h2>概述</h2>
          <p>{{ stack.description }}</p>
          <p>{{ stack.longDescription }}</p>
        </section>

        <section class="components">
          <h2>组成部分</h2>
          <div class="component-cards">
            <div class="component-card" v-for="(component, index) in stack.components" :key="index">
              <div class="component-icon">{{ component.icon }}</div>
              <div class="component-content">
                <h3>{{ component.name }}</h3>
                <p>{{ component.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="advantages">
          <h2>优势与适用场景</h2>
          <div class="advantages-grid">
            <div class="advantage-card" v-for="(advantage, index) in stack.advantages" :key="index">
              <div class="advantage-icon">{{ advantage.icon }}</div>
              <h3>{{ advantage.title }}</h3>
              <p>{{ advantage.description }}</p>
            </div>
          </div>
        </section>

        <section class="code-example">
          <h2>示例架构</h2>
          <div class="code-block">
            <pre><code>{{ stack.codeExample }}</code></pre>
          </div>
        </section>
      </div>

      <div class="sidebar">
        <div class="popularity-card">
          <h3>流行度</h3>
          <div class="popularity-meter">
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: (stack.popularity * 20) + '%' }"></div>
            </div>
            <div class="meter-label">{{ getPopularityText(stack.popularity) }}</div>
          </div>
          <div class="popularity-stats">
            <div class="stat-item">
              <span class="stat-label">GitHub使用率</span>
              <span class="stat-value">{{ stack.stats?.github || 'N/A' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">职位需求</span>
              <span class="stat-value">{{ stack.stats?.jobs || 'N/A' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">社区支持</span>
              <span class="stat-value">{{ stack.stats?.community || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="learning-path-card">
          <h3>学习路径</h3>
          <ol>
            <li v-for="(step, index) in stack.learningPath" :key="index">
              {{ step }}
            </li>
          </ol>
          <button class="start-learning">开始学习</button>
        </div>

        <div class="resources-card">
          <h3>相关资源</h3>
          <ul>
            <li v-for="(resource, index) in stack.resources" :key="index">
              <a :href="resource.url" target="_blank">{{ resource.title }}</a>
            </li>
          </ul>
        </div>

        <div class="related-card">
          <h3>相关技术栈</h3>
          <div class="related-items">
            <div class="related-item" v-for="relatedStack in stack.relatedStacks" :key="relatedStack.id" @click="goToStack(relatedStack.id)">
              <div class="related-icon">{{ relatedStack.icon }}</div>
              <span>{{ relatedStack.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="loading" v-else>加载中...</div>
</template>

<script>
export default {
  name: 'StackDetailView',
  data() {
    return {
      stack: null,
      stacks: {
        mern: {
          id: 'mern',
          name: 'MERN Stack',
          icon: '📱',
          tags: ['全栈', 'JavaScript'],
          popularity: 4,
          description: 'MongoDB, Express, React, Node.js 组成的JavaScript全栈开发技术栈。',
          longDescription: 'MERN是一个由MongoDB, Express.js, React和Node.js组成的JavaScript技术栈。这四种技术都基于JavaScript语言，使开发人员可以使用单一的编程语言构建完整的Web应用，包括前端界面和后端服务。MERN栈的每个组件都是开源的，有大量的社区支持和资源，适合构建现代的、响应式的、高性能的Web应用。',
          components: [
            { name: 'MongoDB', icon: '🍃', description: '一个文档型NoSQL数据库，使用JSON格式存储数据，适合处理大量非结构化数据。' },
            { name: 'Express', icon: '🚂', description: '基于Node.js的Web应用框架，提供了一组强大的功能来构建单页和多页Web应用。' },
            { name: 'React', icon: '⚛️', description: '由Facebook开发的JavaScript库，用于构建用户界面，特别是单页应用程序。' },
            { name: 'Node.js', icon: '🟢', description: '一个基于Chrome V8引擎的JavaScript运行时，用于构建可扩展的网络应用和后端服务。' }
          ],
          advantages: [
            { icon: '🔄', title: '全JavaScript栈', description: '前后端统一的JavaScript语言，减少了技术切换成本，提高开发效率。' },
            { icon: '⚡', title: '高性能', description: 'Node.js的非阻塞I/O和MongoDB的文档存储模型提供了优秀的性能表现。' },
            { icon: '📦', title: 'JSON数据流', description: '从数据库到客户端全程使用JSON数据格式，无需进行数据转换。' },
            { icon: '🛠️', title: '大型社区支持', description: '所有组件都有庞大的社区和丰富的资源，生态系统成熟健全。' }
          ],
          codeExample: `// 基本的MERN应用架构示例

// 前端React组件
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // 从Express API获取数据
    axios.get('/api/data')
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);
  
  return (
    <div className="App">
      {data.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}

// 后端Express API
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// 连接MongoDB
mongoose.connect('mongodb://localhost/mern_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 定义数据模型
const Item = mongoose.model('Item', {
  name: String,
  date: { type: Date, default: Date.now }
});

// API路由
app.get('/api/data', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));`,
          stats: {
            github: '高',
            jobs: '非常高',
            community: '活跃'
          },
          learningPath: [
            '学习JavaScript和ES6+语法',
            '学习React基础和Hooks',
            '学习Node.js和Express框架',
            '学习MongoDB数据库操作',
            '构建RESTful API',
            '整合前后端进行全栈开发',
            '学习部署和DevOps相关知识'
          ],
          resources: [
            { title: 'React官方文档', url: 'https://reactjs.org/' },
            { title: 'Node.js官方文档', url: 'https://nodejs.org/' },
            { title: 'Express指南', url: 'https://expressjs.com/' },
            { title: 'MongoDB教程', url: 'https://docs.mongodb.com/' },
            { title: 'MERN Stack前后端工程师指南', url: '#' }
          ],
          relatedStacks: [
            { id: 'mean', name: 'MEAN Stack', icon: '🌐' },
            { id: 'mevn', name: 'MEVN Stack', icon: '🎨' },
            { id: 'jamstack', name: 'JAMStack', icon: '🚀' },
            { id: 'nextjs', name: 'Next.js', icon: '⏭️' }
          ]
        }
      }
    }
  },
  mounted() {
    // 从URL中获取技术栈ID
    const stackId = this.$route.params.id;
    
    // 模拟API请求 - 实际使用中应该从API获取数据
    // 这里我们只提供了MERN栈的详细数据作为示例
    if (this.stacks[stackId]) {
      this.stack = this.stacks[stackId];
    } else {
      // 如果找不到指定技术栈，创建一个简单的占位数据
      this.stack = {
        id: stackId,
        name: stackId.toUpperCase() + ' Stack',
        icon: '🔧',
        tags: ['技术栈'],
        popularity: 3,
        description: `这是${stackId.toUpperCase()}技术栈的详情页面。`,
        longDescription: '这里将包含该技术栈的详细介绍和历史背景。',
        components: [
          { name: '组件1', icon: '📦', description: '该技术栈的核心组件1' },
          { name: '组件2', icon: '🔌', description: '该技术栈的核心组件2' }
        ],
        advantages: [
          { icon: '✅', title: '优势1', description: '该技术栈的主要优势1' },
          { icon: '🚀', title: '优势2', description: '该技术栈的主要优势2' }
        ],
        codeExample: `// ${stackId} 技术栈示例代码
console.log("Hello from ${stackId} stack!");`,
        stats: {
          github: '中等',
          jobs: '中等',
          community: '活跃'
        },
        learningPath: [
          '学习基础组件',
          '理解架构设计',
          '实践项目开发'
        ],
        resources: [
          { title: '官方文档', url: '#' },
          { title: '推荐教程', url: '#' }
        ],
        relatedStacks: [
          { id: 'mern', name: 'MERN Stack', icon: '📱' }
        ]
      };
    }
  },
  methods: {
    goToStack(stackId) {
      this.$router.push(`/stack/${stackId}`);
    },
    getPopularityText(level) {
      const levels = ['非常低', '低', '中等', '高', '非常高'];
      return levels[level - 1] || '未知';
    }
  }
}
</script> 