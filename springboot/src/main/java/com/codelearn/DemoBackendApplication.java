package com.codelearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * SpringBoot 应用主启动类
 * 
 * @SpringBootApplication 包含了以下注解：
 * - @Configuration: 标识这是一个配置类
 * - @EnableAutoConfiguration: 启用自动配置
 * - @ComponentScan: 启用组件扫描
 * 
 * @EnableJpaAuditing: 启用JPA审计功能（自动填充创建时间、更新时间等）
 * @EnableCaching: 启用缓存功能
 * @EnableConfigurationProperties: 启用配置属性绑定
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableConfigurationProperties
public class DemoBackendApplication {

    public static void main(String[] args) {
        // 启动SpringBoot应用
        SpringApplication.run(DemoBackendApplication.class, args);
        
        System.out.println("\n" +
                "=================================================\n" +
                "  CodeLearn Backend API 启动成功!\n" +
                "  端口: 8080\n" +
                "  API前缀: /api\n" +
                "  H2控制台: http://localhost:8080/api/h2-console\n" +
                "  健康检查: http://localhost:8080/api/actuator/health\n" +
                "  API文档: http://localhost:8080/api/users (示例接口)\n" +
                "=================================================\n");
    }
} 