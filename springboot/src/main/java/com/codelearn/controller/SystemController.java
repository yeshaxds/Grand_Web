package com.codelearn.controller;

import com.codelearn.common.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统管理控制器
 * 提供系统状态、健康检查等功能
 */
@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Autowired
    private DataSource dataSource;
    
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    
    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;
    
    @Value("${spring.data.redis.port:6379}")
    private int redisPort;
    
    @Value("${spring.data.redis.database:0}")
    private int redisDatabase;
    
    @Value("${spring.data.redis.timeout:2000ms}")
    private String redisTimeout;
    
    @Value("${spring.data.redis.lettuce.pool.max-active:8}")
    private int redisMaxActive;

    /**
     * 健康检查接口
     * 检查应用程序和数据库连接状态
     */
    @GetMapping("/health")
    public ResponseResult<Map<String, Object>> health() {
        try {
            Map<String, Object> healthInfo = new HashMap<>();
            
            // 基本状态
            healthInfo.put("status", "UP");
            healthInfo.put("timestamp", LocalDateTime.now());
            
            // 组件状态
            Map<String, Object> components = new HashMap<>();
            
            // 检查数据库连接
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(1)) {
                    components.put("database", Map.of("status", "UP"));
                } else {
                    components.put("database", Map.of("status", "DOWN"));
                }
            } catch (Exception e) {
                components.put("database", Map.of("status", "DOWN", "error", e.getMessage()));
            }
            
            // 磁盘空间检查（简化版）
            try {
                java.io.File file = new java.io.File(".");
                long freeSpace = file.getFreeSpace();
                long totalSpace = file.getTotalSpace();
                
                components.put("diskSpace", Map.of(
                    "status", freeSpace > 1024 * 1024 * 100 ? "UP" : "LOW", // 100MB阈值
                    "free", freeSpace,
                    "total", totalSpace
                ));
            } catch (Exception e) {
                components.put("diskSpace", Map.of("status", "UNKNOWN"));
            }
            
            healthInfo.put("components", components);
            
            return ResponseResult.success("健康检查完成", healthInfo);
            
        } catch (Exception e) {
            Map<String, Object> errorInfo = Map.of(
                "status", "DOWN",
                "timestamp", LocalDateTime.now(),
                "error", e.getMessage()
            );
            return ResponseResult.error(500, "健康检查失败");
        }
    }

    /**
     * 获取系统信息
     */
    @GetMapping("/info")
    public ResponseResult<Map<String, Object>> info() {
        Map<String, Object> systemInfo = new HashMap<>();
        
        // 应用信息
        Map<String, Object> appInfo = new HashMap<>();
        appInfo.put("name", "CodeLearn Backend");
        appInfo.put("version", "1.0.0");
        appInfo.put("description", "SpringBoot演示项目");
        
        // Java环境信息
        Map<String, Object> javaInfo = new HashMap<>();
        javaInfo.put("version", System.getProperty("java.version"));
        javaInfo.put("vendor", System.getProperty("java.vendor"));
        javaInfo.put("runtime", System.getProperty("java.runtime.name"));
        
        // 系统信息
        Map<String, Object> osInfo = new HashMap<>();
        osInfo.put("name", System.getProperty("os.name"));
        osInfo.put("version", System.getProperty("os.version"));
        osInfo.put("arch", System.getProperty("os.arch"));
        
        // 内存信息
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memoryInfo = new HashMap<>();
        memoryInfo.put("total", runtime.totalMemory());
        memoryInfo.put("free", runtime.freeMemory());
        memoryInfo.put("used", runtime.totalMemory() - runtime.freeMemory());
        memoryInfo.put("max", runtime.maxMemory());
        
        systemInfo.put("app", appInfo);
        systemInfo.put("java", javaInfo);
        systemInfo.put("os", osInfo);
        systemInfo.put("memory", memoryInfo);
        systemInfo.put("timestamp", LocalDateTime.now());
        
        return ResponseResult.success("获取系统信息成功", systemInfo);
    }

    /**
     * 获取数据库信息
     */
    @GetMapping("/database")
    public ResponseResult<Map<String, Object>> database() {
        try {
            Map<String, Object> dbInfo = new HashMap<>();
            
            try (Connection connection = dataSource.getConnection()) {
                var metaData = connection.getMetaData();
                
                dbInfo.put("productName", metaData.getDatabaseProductName());
                dbInfo.put("productVersion", metaData.getDatabaseProductVersion());
                dbInfo.put("driverName", metaData.getDriverName());
                dbInfo.put("driverVersion", metaData.getDriverVersion());
                dbInfo.put("url", metaData.getURL());
                dbInfo.put("username", metaData.getUserName());
                dbInfo.put("isValid", connection.isValid(1));
                dbInfo.put("timestamp", LocalDateTime.now());
            }
            
            return ResponseResult.success("获取数据库信息成功", dbInfo);
            
        } catch (Exception e) {
            return ResponseResult.error(500, "获取数据库信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取Redis信息
     */
    @GetMapping("/redis")
    public ResponseResult<Map<String, Object>> redis() {
        try {
            Map<String, Object> redisInfo = new HashMap<>();
            
            // 基本配置信息
            redisInfo.put("host", redisHost);
            redisInfo.put("port", redisPort);
            redisInfo.put("database", redisDatabase);
            redisInfo.put("timeout", redisTimeout);
            redisInfo.put("maxActive", redisMaxActive);
            redisInfo.put("timestamp", LocalDateTime.now());
            
            // 连接状态检查
            if (redisTemplate != null) {
                try {
                    RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
                    String pong = connection.ping();
                    redisInfo.put("status", "UP");
                    redisInfo.put("ping", pong);
                    connection.close();
                } catch (Exception e) {
                    redisInfo.put("status", "DOWN");
                    redisInfo.put("error", e.getMessage());
                }
            } else {
                redisInfo.put("status", "NOT_CONFIGURED");
                redisInfo.put("message", "Redis未配置或未启用");
            }
            
            return ResponseResult.success("获取Redis信息成功", redisInfo);
            
        } catch (Exception e) {
            return ResponseResult.error(500, "获取Redis信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取SpringBoot功能特性
     */
    @GetMapping("/features")
    public ResponseResult<Map<String, Object>> features() {
        try {
            Map<String, Object> featuresInfo = new HashMap<>();
            
            // 核心功能
            Map<String, Object> coreFeatures = new HashMap<>();
            coreFeatures.put("autoConfiguration", Map.of(
                "enabled", true,
                "description", "SpringBoot自动配置机制"
            ));
            coreFeatures.put("starterDependencies", Map.of(
                "enabled", true,
                "description", "简化的依赖管理"
            ));
            coreFeatures.put("embeddedServer", Map.of(
                "enabled", true,
                "description", "内置Tomcat服务器"
            ));
            coreFeatures.put("productionReady", Map.of(
                "enabled", true,
                "description", "Actuator监控和健康检查"
            ));
            
            // Web功能
            Map<String, Object> webFeatures = new HashMap<>();
            webFeatures.put("restfulApi", Map.of(
                "enabled", true,
                "description", "完整的REST接口设计"
            ));
            webFeatures.put("jsonSerialization", Map.of(
                "enabled", true,
                "description", "自动JSON请求/响应处理"
            ));
            webFeatures.put("corsSupport", Map.of(
                "enabled", true,
                "description", "跨域支持配置"
            ));
            webFeatures.put("parameterValidation", Map.of(
                "enabled", true,
                "description", "Bean Validation校验"
            ));
            webFeatures.put("unifiedResponse", Map.of(
                "enabled", true,
                "description", "ResponseResult统一返回格式"
            ));
            
            // 数据访问功能
            Map<String, Object> dataFeatures = new HashMap<>();
            dataFeatures.put("springDataJpa", Map.of(
                "enabled", true,
                "description", "简化的数据库访问"
            ));
            dataFeatures.put("h2Database", Map.of(
                "enabled", true,
                "description", "内存数据库，即开即用"
            ));
            dataFeatures.put("transactionManagement", Map.of(
                "enabled", true,
                "description", "声明式事务处理"
            ));
            dataFeatures.put("auditingFeature", Map.of(
                "enabled", true,
                "description", "自动记录创建/更新时间"
            ));
            dataFeatures.put("queryMethods", Map.of(
                "enabled", true,
                "description", "多种查询方式演示"
            ));
            
            // 缓存功能
            Map<String, Object> cacheFeatures = new HashMap<>();
            boolean redisAvailable = redisTemplate != null;
            cacheFeatures.put("springCache", Map.of(
                "enabled", true,
                "description", "声明式缓存"
            ));
            cacheFeatures.put("redisIntegration", Map.of(
                "enabled", redisAvailable,
                "description", "Redis作为缓存存储",
                "status", redisAvailable ? "available" : "not configured"
            ));
            cacheFeatures.put("cacheAnnotations", Map.of(
                "enabled", true,
                "description", "@Cacheable等注解使用"
            ));
            cacheFeatures.put("cacheManagement", Map.of(
                "enabled", true,
                "description", "统一的缓存配置"
            ));
            
            // 安全功能
            Map<String, Object> securityFeatures = new HashMap<>();
            securityFeatures.put("springSecurity", Map.of(
                "enabled", true,
                "description", "企业级安全框架"
            ));
            securityFeatures.put("corsConfiguration", Map.of(
                "enabled", true,
                "description", "CORS安全设置"
            ));
            securityFeatures.put("csrfProtection", Map.of(
                "enabled", false,
                "description", "可配置的CSRF保护"
            ));
            
            // 监控功能
            Map<String, Object> monitoringFeatures = new HashMap<>();
            monitoringFeatures.put("actuator", Map.of(
                "enabled", true,
                "description", "生产级应用监控"
            ));
            monitoringFeatures.put("healthCheck", Map.of(
                "enabled", true,
                "description", "应用健康状态监控"
            ));
            monitoringFeatures.put("metricsCollection", Map.of(
                "enabled", true,
                "description", "运行时指标统计"
            ));
            monitoringFeatures.put("configurationViewing", Map.of(
                "enabled", true,
                "description", "运行时配置信息"
            ));
            
            // 组装所有功能特性
            featuresInfo.put("core", coreFeatures);
            featuresInfo.put("web", webFeatures);
            featuresInfo.put("data", dataFeatures);
            featuresInfo.put("cache", cacheFeatures);
            featuresInfo.put("security", securityFeatures);
            featuresInfo.put("monitoring", monitoringFeatures);
            featuresInfo.put("timestamp", LocalDateTime.now());
            
            return ResponseResult.success("获取功能特性成功", featuresInfo);
            
        } catch (Exception e) {
            return ResponseResult.error(500, "获取功能特性失败: " + e.getMessage());
        }
    }
} 