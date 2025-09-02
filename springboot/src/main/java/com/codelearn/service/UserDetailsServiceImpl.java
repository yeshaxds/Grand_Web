package com.codelearn.service;

import com.codelearn.entity.User;
import com.codelearn.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * 用户详情服务实现类
 * 实现SpringSecurity的UserDetailsService接口
 * 用于从数据库加载用户信息进行认证
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("加载用户信息：{}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));
        
        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new UsernameNotFoundException("用户已被禁用: " + username);
        }
        
        return UserPrincipal.create(user);
    }
    
    /**
     * 根据用户ID加载用户信息
     */
    public UserDetails loadUserById(Long id) {
        log.info("根据ID加载用户信息：{}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在，ID: " + id));
        
        return UserPrincipal.create(user);
    }
    
    /**
     * 用户主体类
     * 实现SpringSecurity的UserDetails接口
     */
    public static class UserPrincipal implements UserDetails {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Collection<? extends GrantedAuthority> authorities;
        private boolean enabled;
        
        public UserPrincipal(Long id, String username, String email, String password, 
                            Collection<? extends GrantedAuthority> authorities, boolean enabled) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.password = password;
            this.authorities = authorities;
            this.enabled = enabled;
        }
        
        public static UserPrincipal create(User user) {
            // 根据用户角色生成权限
            Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );
            
            return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                user.getStatus() == 1
            );
        }
        
        public Long getId() {
            return id;
        }
        
        public String getEmail() {
            return email;
        }
        
        @Override
        public String getUsername() {
            return username;
        }
        
        @Override
        public String getPassword() {
            return password;
        }
        
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }
        
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }
        
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }
        
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }
        
        @Override
        public boolean isEnabled() {
            return enabled;
        }
    }
} 