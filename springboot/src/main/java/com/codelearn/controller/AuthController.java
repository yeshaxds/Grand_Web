package com.codelearn.controller;

import com.codelearn.common.AuthRequest;
import com.codelearn.common.AuthResponse;
import com.codelearn.common.ResponseResult;
import com.codelearn.config.JwtUtils;
import com.codelearn.entity.User;
import com.codelearn.service.UserDetailsServiceImpl;
import com.codelearn.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 处理用户登录、注册、登出等认证相关操作
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseResult<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        log.info("用户登录请求: {}", authRequest.getUsername());
        
        try {
            // 进行用户认证
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(),
                    authRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 生成JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            // 获取用户详情
            UserDetailsServiceImpl.UserPrincipal userPrincipal = 
                (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
            
            AuthResponse authResponse = new AuthResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getAuthorities().iterator().next().getAuthority()
            );
            
            log.info("用户登录成功: {}", authRequest.getUsername());
            return ResponseResult.success("登录成功", authResponse);
            
        } catch (Exception e) {
            log.error("用户登录失败: {}", e.getMessage());
            return ResponseResult.badRequest("用户名或密码错误");
        }
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseResult<String> register(@Valid @RequestBody User user) {
        log.info("用户注册请求: {}", user.getUsername());
        
        try {
            // 检查用户名是否已存在
            if (userService.getUserByUsername(user.getUsername()).isPresent()) {
                return ResponseResult.badRequest("用户名已存在");
            }
            
            // 检查邮箱是否已存在
            if (userService.getUserByEmail(user.getEmail()).isPresent()) {
                return ResponseResult.badRequest("邮箱已存在");
            }
            
            // 加密密码
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // 设置默认角色
            if (user.getRole() == null) {
                user.setRole(User.UserRole.USER);
            }
            
            // 创建用户
            userService.createUser(user);
            
            log.info("用户注册成功: {}", user.getUsername());
            return ResponseResult.success("注册成功");
            
        } catch (Exception e) {
            log.error("用户注册失败: {}", e.getMessage());
            return ResponseResult.error("注册失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ResponseResult<String> logout() {
        log.info("用户登出");
        
        // 清除安全上下文
        SecurityContextHolder.clearContext();
        
        return ResponseResult.success("登出成功");
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ResponseResult<Object> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseResult.unauthorized("未登录");
        }
        
        UserDetailsServiceImpl.UserPrincipal userPrincipal = 
            (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        
        return ResponseResult.success("获取用户信息成功", userPrincipal);
    }
    
    /**
     * 验证token有效性
     */
    @GetMapping("/validate")
    public ResponseResult<Object> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUsernameFromJwtToken(jwt);
                    return ResponseResult.success("Token有效", username);
                }
            }
            
            return ResponseResult.unauthorized("Token无效");
            
        } catch (Exception e) {
            log.error("Token验证失败: {}", e.getMessage());
            return ResponseResult.unauthorized("Token验证失败");
        }
    }
} 