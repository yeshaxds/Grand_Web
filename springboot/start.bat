@echo off
chcp 65001
title CodeLearn SpringBoot Backend

echo ===============================================
echo   CodeLearn SpringBoot 后端服务启动脚本
echo ===============================================
echo.

echo 正在检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误：未找到Java环境，请确保Java 17或更高版本已安装并配置到PATH
    pause
    exit /b 1
)

echo.
echo 正在检查Maven环境...
mvn -version
if %errorlevel% neq 0 (
    echo 错误：未找到Maven环境，请确保Maven已安装并配置到PATH
    pause
    exit /b 1
)

echo.
echo 正在启动SpringBoot应用...
echo.

mvn spring-boot:run

pause 