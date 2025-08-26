package com.codelearn.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 用户实体类
 * 演示SpringBoot JPA的基本功能
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)  // 启用JPA审计
public class User {
    
    /**
     * 主键，自增
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 用户名，唯一，非空
     */
    @Column(unique = true, nullable = false, length = 50)
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
    private String username;
    
    /**
     * 邮箱，唯一，非空
     */
    @Column(unique = true, nullable = false, length = 100)
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    /**
     * 密码，非空
     */
    @Column(nullable = false)
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度不能少于6个字符")
    private String password;
    
    /**
     * 用户状态：1-正常，0-禁用
     */
    @Column(nullable = false)
    private Integer status = 1;
    
    /**
     * 用户角色：USER, ADMIN
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.USER;
    
    /**
     * 创建时间，自动填充
     */
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间，自动填充
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * 兼容前端的创建时间字段
     */
    @Transient
    public LocalDateTime getCreateTime() {
        return createdAt;
    }
    
    /**
     * 兼容前端的更新时间字段
     */
    @Transient
    public LocalDateTime getUpdateTime() {
        return updatedAt;
    }
    
    /**
     * 用户角色枚举
     */
    public enum UserRole {
        USER, ADMIN
    }
    
    /**
     * 构造函数（不包含ID和时间字段）
     */
    public User(String username, String email, String password, UserRole role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
} 