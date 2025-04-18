<template>
    <!-- 全局背景图层 -->
    <div class="global-background-layer"></div>

    <nav>
        <div class="logo">
            <img src="@/assets/logo.webp" alt="网站Logo">
            <span>CodeLearn</span>
        </div>
        <div class="nav-links">
            <router-link to="/">首页</router-link>
            <router-link to="/languages">编程语言</router-link>
            <router-link to="/stacks">技术栈</router-link>
            <router-link to="/resources">学习资源</router-link>
            <router-link to="/code-editor">代码编辑器</router-link>
            <router-link to="/chat">AI对话</router-link>
            <router-link to="/about">关于我们</router-link>
        </div>
    </nav>
    <router-view />
</template>

<style>
/* 全局样式 */
body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
}

/* 全局背景图层 */
.global-background-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/images/coding-background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.4;
    z-index: -1;
    pointer-events: none;
    /* 允许点击事件穿透背景层 */
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
}

.logo {
    display: flex;
    align-items: center;
}

.logo img {
    height: 40px;
    margin-right: 10px;
}

.logo span {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4285f4;
}

.nav-links {
    display: flex;
    gap: 20px;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s, color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
    background-color: #4285f4;
    color: white;
}
</style>