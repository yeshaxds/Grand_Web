@echo off
chcp 65001
title Redis后端演示服务器

echo ===============================================
echo   Redis 后端演示服务器启动脚本
echo ===============================================
echo.

echo 正在检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js环境，请确保Node.js已安装并配置到PATH
    pause
    exit /b 1
)

echo.
echo 正在检查Redis服务器...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告：Redis服务器未运行，某些功能可能受限
    echo 请确保Redis服务器在localhost:6379运行
    echo.
) else (
    echo ✓ Redis服务器连接正常
    echo.
)

echo 正在安装依赖包...
call npm install
if %errorlevel% neq 0 (
    echo 错误：依赖包安装失败
    pause
    exit /b 1
)

echo.
echo 正在启动Redis后端服务器...
echo 服务器将在 http://localhost:8081 启动
echo 按 Ctrl+C 停止服务器
echo.

npm start

pause 