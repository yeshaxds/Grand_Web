@echo off
echo 启动 Spring Cloud 微服务架构

echo 1. 启动 Eureka 服务注册中心...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"

echo 等待5秒，让 Eureka 先启动...
timeout /t 5

echo 2. 启动用户服务...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo 3. 启动产品服务...
start "Product Service" cmd /k "cd product-service && mvn spring-boot:run"

echo 等待3秒，让微服务注册到 Eureka...
timeout /t 3

echo 4. 启动网关...
start "Gateway" cmd /k "cd gateway && mvn spring-boot:run"

echo 所有服务启动完成！
echo Eureka 控制台: http://localhost:8761
echo 网关地址: http://localhost:8080
echo 用户服务: http://localhost:8081
echo 产品服务: http://localhost:8082

pause 