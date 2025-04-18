// 鼠标点击特效
function createClickEffect() {
  // 创建各种点击特效的函数集合
  const effects = {
    // 简单的涟漪效果
    ripple: (event) => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
      
      // 创建涟漪元素
      for (let i = 0; i < 3; i++) {
        const circle = document.createElement('div');
        circle.className = 'click-effect-ripple';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 设置样式
        circle.style.left = `${event.clientX}px`;
        circle.style.top = `${event.clientY}px`;
        circle.style.borderColor = color;
        
        // 添加到文档
        document.body.appendChild(circle);
        
        // 动画结束后移除元素
        setTimeout(() => {
          document.body.removeChild(circle);
        }, 1000);
      }
    },
    
    // 粒子爆炸效果
    particles: (event) => {
      const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
      
      // 创建多个粒子
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-effect-particle';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 50;
        const duration = Math.random() * 0.6 + 0.4;
        
        // 设置初始位置
        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;
        particle.style.backgroundColor = color;
        particle.style.opacity = 1;
        
        // 随机大小
        const size = Math.floor(Math.random() * 8 + 4);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 添加到文档
        document.body.appendChild(particle);
        
        // 通过CSS变换实现动画
        setTimeout(() => {
          particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
          particle.style.opacity = 0;
        }, 10);
        
        // 动画结束后移除元素
        setTimeout(() => {
          document.body.removeChild(particle);
        }, duration * 1000);
      }
    },
    
    // 星星闪烁效果
    stars: (event) => {
      const colors = ['#ffff00', '#ffffaa', '#aaffff', '#ffffff', '#ffaaff'];
      
      for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.className = 'click-effect-star';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机角度和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 20;
        
        // 随机大小
        const size = Math.floor(Math.random() * 15 + 10);
        
        // 设置样式
        star.style.left = `${event.clientX}px`;
        star.style.top = `${event.clientY}px`;
        star.style.backgroundColor = color;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 添加到文档
        document.body.appendChild(star);
        
        // 应用动画
        setTimeout(() => {
          star.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(45deg) scale(0)`;
        }, 10);
        
        // 动画结束后移除元素
        setTimeout(() => {
          document.body.removeChild(star);
        }, 700);
      }
    },
    
    // 爱心效果
    hearts: (event) => {
      const colors = ['#ff0000', '#ff4444', '#ff66aa', '#ff00aa'];
      
      for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'click-effect-heart';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机大小
        const size = Math.floor(Math.random() * 20 + 10);
        
        // 随机角度和上升高度
        const angle = (Math.random() - 0.5) * 0.8;
        const distance = Math.random() * 100 + 50;
        
        // 设置样式
        heart.style.left = `${event.clientX - size / 2}px`;
        heart.style.top = `${event.clientY - size / 2}px`;
        heart.style.color = color;
        heart.style.fontSize = `${size}px`;
        
        // 添加到文档
        heart.innerHTML = '❤';
        document.body.appendChild(heart);
        
        // 应用动画
        setTimeout(() => {
          heart.style.transform = `translate(${angle * distance}px, ${-distance}px) rotate(${angle * 20}deg)`;
          heart.style.opacity = 0;
        }, 10);
        
        // 动画结束后移除元素
        setTimeout(() => {
          document.body.removeChild(heart);
        }, 1000);
      }
    },
    
    // 彩色文字效果
    text: (event) => {
      const texts = ['棒！', '厉害！', '牛！', '哇！', '酷！', '666！', '帅！', '赞！'];
      const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
      
      for (let i = 0; i < 3; i++) {
        const textEl = document.createElement('div');
        textEl.className = 'click-effect-text';
        
        // 随机文字和颜色
        const text = texts[Math.floor(Math.random() * texts.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机角度和上升高度
        const angle = (Math.random() - 0.5) * 1.2;
        const distance = Math.random() * 60 + 40;
        
        // 设置样式
        textEl.style.left = `${event.clientX}px`;
        textEl.style.top = `${event.clientY}px`;
        textEl.style.color = color;
        textEl.innerHTML = text;
        
        // 添加到文档
        document.body.appendChild(textEl);
        
        // 应用动画
        setTimeout(() => {
          textEl.style.transform = `translate(${angle * 30}px, ${-distance}px) scale(1.2)`;
          textEl.style.opacity = 0;
        }, 10);
        
        // 动画结束后移除元素
        setTimeout(() => {
          document.body.removeChild(textEl);
        }, 1000);
      }
    }
  };
  
  // 创建随机效果的函数
  function createRandomEffect(event) {
    const effectTypes = Object.keys(effects);
    const randomType = effectTypes[Math.floor(Math.random() * effectTypes.length)];
    effects[randomType](event);
  }
  
  // 添加点击事件监听器
  document.addEventListener('click', (event) => {
    createRandomEffect(event);
  });
}

// 导出函数
export default createClickEffect; 