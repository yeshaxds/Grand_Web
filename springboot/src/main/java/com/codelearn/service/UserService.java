package com.codelearn.service;

import com.codelearn.entity.User;
import com.codelearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 用户服务类
 * 演示SpringBoot的服务层设计和缓存功能
 */
@Service
@RequiredArgsConstructor  // Lombok生成构造函数
@Slf4j  // Lombok生成日志对象
@Transactional(readOnly = true)  // 默认只读事务
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * 获取所有用户
     * 使用缓存提高性能，Redis不可用时降级到直接访问数据库
     */
    public List<User> getAllUsers() {
        log.info("从数据库获取所有用户");
        try {
            return getAllUsersWithCache();
        } catch (Exception e) {
            log.warn("Redis缓存不可用，降级到直接访问数据库: {}", e.getMessage());
            return userRepository.findAll();
        }
    }
    
    /**
     * 带缓存的获取所有用户方法
     */
    @Cacheable(value = "users", key = "'all'")
    public List<User> getAllUsersWithCache() {
        log.info("从数据库获取所有用户（带缓存）");
        return userRepository.findAll();
    }
    
    /**
     * 根据ID获取用户
     * 缓存单个用户信息，Redis不可用时降级到直接访问数据库
     */
    public Optional<User> getUserById(Long id) {
        log.info("从数据库获取用户，ID: {}", id);
        try {
            return getUserByIdWithCache(id);
        } catch (Exception e) {
            log.warn("Redis缓存不可用，降级到直接访问数据库: {}", e.getMessage());
            return userRepository.findById(id);
        }
    }
    
    /**
     * 带缓存的根据ID获取用户方法
     */
    @Cacheable(value = "users", key = "#id")
    public Optional<User> getUserByIdWithCache(Long id) {
        log.info("从数据库获取用户，ID: {}（带缓存）", id);
        return userRepository.findById(id);
    }
    
    /**
     * 根据用户名获取用户
     * Redis不可用时降级到直接访问数据库
     */
    public Optional<User> getUserByUsername(String username) {
        log.info("根据用户名查找用户: {}", username);
        try {
            return getUserByUsernameWithCache(username);
        } catch (Exception e) {
            log.warn("Redis缓存不可用，降级到直接访问数据库: {}", e.getMessage());
            return userRepository.findByUsername(username);
        }
    }
    
    /**
     * 带缓存的根据用户名获取用户方法
     */
    @Cacheable(value = "users", key = "'username:' + #username")
    public Optional<User> getUserByUsernameWithCache(String username) {
        log.info("根据用户名查找用户: {}（带缓存）", username);
        return userRepository.findByUsername(username);
    }
    
    /**
     * 根据邮箱获取用户
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * 创建用户
     * 清除缓存，Redis不可用时降级到直接操作数据库
     */
    @Transactional  // 开启写事务
    public User createUser(User user) {
        log.info("创建新用户: {}", user.getUsername());
        
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在: " + user.getUsername());
        }
        
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已存在: " + user.getEmail());
        }
        
        User savedUser = userRepository.save(user);
        
        // 尝试清除缓存
        try {
            evictAllUserCache();
        } catch (Exception e) {
            log.warn("Redis缓存不可用，跳过缓存清除: {}", e.getMessage());
        }
        
        return savedUser;
    }
    
    /**
     * 清除所有用户缓存
     */
    @CacheEvict(value = "users", allEntries = true)
    public void evictAllUserCache() {
        log.info("清除所有用户缓存");
    }
    
    /**
     * 更新用户
     * 清除特定用户的缓存，Redis不可用时降级到直接操作数据库
     */
    @Transactional
    public User updateUser(User user) {
        log.info("更新用户: {}", user.getId());
        
        if (!userRepository.existsById(user.getId())) {
            throw new RuntimeException("用户不存在: " + user.getId());
        }
        
        User savedUser = userRepository.save(user);
        
        // 尝试清除特定用户缓存
        try {
            evictUserCache(user.getId());
        } catch (Exception e) {
            log.warn("Redis缓存不可用，跳过缓存清除: {}", e.getMessage());
        }
        
        return savedUser;
    }
    
    /**
     * 清除特定用户缓存
     */
    @CacheEvict(value = "users", key = "#id")
    public void evictUserCache(Long id) {
        log.info("清除用户缓存，ID: {}", id);
    }
    
    /**
     * 删除用户
     * 清除缓存，Redis不可用时降级到直接操作数据库
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("删除用户: {}", id);
        
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在: " + id);
        }
        
        userRepository.deleteById(id);
        
        // 尝试清除缓存
        try {
            evictAllUserCache();
        } catch (Exception e) {
            log.warn("Redis缓存不可用，跳过缓存清除: {}", e.getMessage());
        }
    }
    
    /**
     * 分页获取用户
     */
    public Page<User> getUsersWithPagination(Pageable pageable) {
        log.info("分页获取用户，页码: {}, 大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        return userRepository.findAll(pageable);
    }
    
    /**
     * 搜索用户
     */
    public Page<User> searchUsers(String keyword, Pageable pageable) {
        log.info("搜索用户，关键词: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll(pageable);
        }
        return userRepository.searchActiveUsers(keyword.trim(), pageable);
    }
    
    /**
     * 获取活跃用户
     */
    public List<User> getActiveUsers() {
        log.info("获取活跃用户列表");
        return userRepository.findActiveUsers();
    }
    
    /**
     * 获取用户统计信息
     */
    public UserStats getUserStats() {
        log.info("获取用户统计信息");
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findActiveUsers().size();
        long adminUsers = userRepository.findByRole(User.UserRole.ADMIN).size();
        
        return new UserStats(totalUsers, activeUsers, adminUsers);
    }
    
    /**
     * 用户统计信息类
     */
    public static class UserStats {
        public final long totalUsers;
        public final long activeUsers;
        public final long adminUsers;
        
        public UserStats(long totalUsers, long activeUsers, long adminUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.adminUsers = adminUsers;
        }
    }
} 