package com.codelearn.controller;

import com.codelearn.common.ResponseResult;
import com.codelearn.entity.User;
import com.codelearn.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 用户控制器
 * 提供用户管理的RESTful API接口
 * 演示SpringBoot Web功能和统一响应格式
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")  // 允许跨域访问
public class UserController {
    
    private final UserService userService;
    
    /**
     * 获取所有用户
     * GET /api/users
     */
    @GetMapping
    public ResponseResult<List<User>> getAllUsers() {
        log.info("请求获取所有用户");
        try {
            List<User> users = userService.getAllUsers();
            return ResponseResult.success("获取用户列表成功", users);
        } catch (Exception e) {
            log.error("获取用户列表失败", e);
            return ResponseResult.error("获取用户列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID获取用户
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseResult<User> getUserById(@PathVariable Long id) {
        log.info("请求获取用户，ID: {}", id);
        try {
            Optional<User> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ResponseResult.success("获取用户信息成功", user.get());
            } else {
                return ResponseResult.notFound("用户不存在");
            }
        } catch (Exception e) {
            log.error("获取用户失败，ID: " + id, e);
            return ResponseResult.error("获取用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建用户
     * POST /api/users
     */
    @PostMapping
    public ResponseResult<User> createUser(@Valid @RequestBody User user) {
        log.info("请求创建用户: {}", user.getUsername());
        try {
            User createdUser = userService.createUser(user);
            return ResponseResult.success("创建用户成功", createdUser);
        } catch (Exception e) {
            log.error("创建用户失败", e);
            return ResponseResult.badRequest("创建用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新用户
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseResult<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        log.info("请求更新用户，ID: {}", id);
        try {
            user.setId(id);
            User updatedUser = userService.updateUser(user);
            return ResponseResult.success("更新用户成功", updatedUser);
        } catch (Exception e) {
            log.error("更新用户失败，ID: " + id, e);
            return ResponseResult.error("更新用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除用户
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseResult<Void> deleteUser(@PathVariable Long id) {
        log.info("请求删除用户，ID: {}", id);
        try {
            userService.deleteUser(id);
            return ResponseResult.success("删除用户成功", null);
        } catch (Exception e) {
            log.error("删除用户失败，ID: " + id, e);
            return ResponseResult.error("删除用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 分页获取用户
     * GET /api/users/page?page=0&size=10&sort=id,desc
     */
    @GetMapping("/page")
    public ResponseResult<Page<User>> getUsersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("请求分页获取用户，页码: {}, 大小: {}, 排序: {} {}", page, size, sortBy, sortDir);
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                       Sort.by(sortBy).descending() : 
                       Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<User> users = userService.getUsersWithPagination(pageable);
            
            return ResponseResult.success("分页获取用户成功", users);
        } catch (Exception e) {
            log.error("分页获取用户失败", e);
            return ResponseResult.error("分页获取用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 搜索用户
     * GET /api/users/search?keyword=john&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseResult<Page<User>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("请求搜索用户，关键词: {}", keyword);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.searchUsers(keyword, pageable);
            
            return ResponseResult.success("搜索用户成功", users);
        } catch (Exception e) {
            log.error("搜索用户失败", e);
            return ResponseResult.error("搜索用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取活跃用户
     * GET /api/users/active
     */
    @GetMapping("/active")
    public ResponseResult<List<User>> getActiveUsers() {
        log.info("请求获取活跃用户");
        try {
            List<User> users = userService.getActiveUsers();
            return ResponseResult.success("获取活跃用户成功", users);
        } catch (Exception e) {
            log.error("获取活跃用户失败", e);
            return ResponseResult.error("获取活跃用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户统计信息
     * GET /api/users/stats
     */
    @GetMapping("/stats")
    public ResponseResult<UserService.UserStats> getUserStats() {
        log.info("请求获取用户统计信息");
        try {
            UserService.UserStats stats = userService.getUserStats();
            return ResponseResult.success("获取用户统计成功", stats);
        } catch (Exception e) {
            log.error("获取用户统计失败", e);
            return ResponseResult.error("获取用户统计失败: " + e.getMessage());
        }
    }
    
    /**
     * 管理员专用 - 获取所有用户（包括禁用用户）
     * GET /api/users/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseResult<List<User>> getAllUsersForAdmin() {
        log.info("管理员请求获取所有用户");
        try {
            List<User> users = userService.getAllUsers();
            return ResponseResult.success("获取所有用户成功", users);
        } catch (Exception e) {
            log.error("获取所有用户失败", e);
            return ResponseResult.error("获取所有用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 管理员专用 - 禁用用户
     * PUT /api/users/admin/{id}/disable
     */
    @PutMapping("/admin/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseResult<String> disableUser(@PathVariable Long id) {
        log.info("管理员请求禁用用户，ID: {}", id);
        try {
            Optional<User> userOpt = userService.getUserById(id);
            if (userOpt.isEmpty()) {
                return ResponseResult.notFound("用户不存在");
            }
            
            User user = userOpt.get();
            user.setStatus(0);
            userService.updateUser(user);
            
            return ResponseResult.success("用户已禁用");
        } catch (Exception e) {
            log.error("禁用用户失败，ID: " + id, e);
            return ResponseResult.error("禁用用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 管理员专用 - 启用用户
     * PUT /api/users/admin/{id}/enable
     */
    @PutMapping("/admin/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseResult<String> enableUser(@PathVariable Long id) {
        log.info("管理员请求启用用户，ID: {}", id);
        try {
            Optional<User> userOpt = userService.getUserById(id);
            if (userOpt.isEmpty()) {
                return ResponseResult.notFound("用户不存在");
            }
            
            User user = userOpt.get();
            user.setStatus(1);
            userService.updateUser(user);
            
            return ResponseResult.success("用户已启用");
        } catch (Exception e) {
            log.error("启用用户失败，ID: " + id, e);
            return ResponseResult.error("启用用户失败: " + e.getMessage());
        }
    }
} 