package com.codelearn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * 安全配置类
 * 配置SpringBoot Security
 * 为了演示方便，这里简化了安全设置
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    /**
     * 配置安全过滤器链
     * 允许所有请求，简化演示
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 禁用CSRF保护（方便API测试）
                .csrf(AbstractHttpConfigurer::disable)
                
                // 配置跨域
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // 配置授权规则
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/h2-console/**").permitAll()  // 允许访问H2控制台
                        .requestMatchers("/actuator/**").permitAll()   // 允许访问监控端点
                        .anyRequest().permitAll()  // 为了演示，允许所有请求
                )
                
                // 禁用帧选项（允许H2控制台嵌入）
                .headers(headers -> headers.frameOptions().disable());
                
        return http.build();
    }
    
    /**
     * 配置跨域
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 