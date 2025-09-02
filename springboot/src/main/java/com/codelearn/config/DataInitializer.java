package com.codelearn.config;

import com.codelearn.entity.User;
import com.codelearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化类
 * 应用启动时自动创建示例数据
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // 检查是否已有数据
        if (userRepository.count() > 0) {
            log.info("数据库中已有数据，跳过初始化");
            return;
        }
        
        log.info("开始初始化示例数据...");
        
        // 创建示例用户（密码加密）
        User admin = new User(
                "admin",
                "admin@codelearn.com",
                passwordEncoder.encode("admin123"),
                User.UserRole.ADMIN
        );
        
        User user1 = new User(
                "john_doe",
                "john@example.com",
                passwordEncoder.encode("password123"),
                User.UserRole.USER
        );
        
        User user2 = new User(
                "jane_smith",
                "jane@example.com",
                passwordEncoder.encode("password456"),
                User.UserRole.USER
        );
        
        User user3 = new User(
                "bob_wilson",
                "bob@example.com",
                passwordEncoder.encode("password789"),
                User.UserRole.USER
        );
        
        // 设置一个禁用用户用于演示
        User disabledUser = new User(
                "disabled_user",
                "disabled@example.com",
                passwordEncoder.encode("password000"),
                User.UserRole.USER
        );
        disabledUser.setStatus(0);  // 设置为禁用状态
        
        // 保存用户
        userRepository.save(admin);
        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
        userRepository.save(disabledUser);
        
        log.info("示例数据初始化完成！");
        log.info("创建了 {} 个用户", userRepository.count());
        log.info("管理员账号: admin / admin123");
    }
} 