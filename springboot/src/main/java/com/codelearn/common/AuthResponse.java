package com.codelearn.common;

import lombok.Data;

/**
 * 登录响应DTO
 */
@Data
public class AuthResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String role;
    
    public AuthResponse(String accessToken, Long userId, String username, String email, String role) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }
} 