package com.codelearn.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 统一API响应结果类
 * 用于标准化所有接口的返回格式
 * 
 * @param <T> 数据的泛型类型
 */
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)  // 只序列化非null字段
public class ResponseResult<T> {
    
    /** 响应状态码 */
    private Integer code;
    
    /** 响应消息 */
    private String message;
    
    /** 响应数据 */
    private T data;
    
    /** 时间戳 */
    private LocalDateTime timestamp;
    
    /** 请求路径 */
    private String path;
    
    public ResponseResult(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    public ResponseResult(Integer code, String message) {
        this(code, message, null);
    }
    
    /**
     * 成功响应（有数据）
     */
    public static <T> ResponseResult<T> success(T data) {
        return new ResponseResult<>(200, "操作成功", data);
    }
    
    /**
     * 成功响应（无数据）
     */
    public static <T> ResponseResult<T> success() {
        return new ResponseResult<>(200, "操作成功");
    }
    
    /**
     * 成功响应（自定义消息）
     */
    public static <T> ResponseResult<T> success(String message, T data) {
        return new ResponseResult<>(200, message, data);
    }
    
    /**
     * 失败响应
     */
    public static <T> ResponseResult<T> error(String message) {
        return new ResponseResult<>(500, message);
    }
    
    /**
     * 失败响应（自定义状态码）
     */
    public static <T> ResponseResult<T> error(Integer code, String message) {
        return new ResponseResult<>(code, message);
    }
    
    /**
     * 参数错误响应
     */
    public static <T> ResponseResult<T> badRequest(String message) {
        return new ResponseResult<>(400, message);
    }
    
    /**
     * 未授权响应
     */
    public static <T> ResponseResult<T> unauthorized(String message) {
        return new ResponseResult<>(401, message);
    }
    
    /**
     * 禁止访问响应
     */
    public static <T> ResponseResult<T> forbidden(String message) {
        return new ResponseResult<>(403, message);
    }
    
    /**
     * 资源不存在响应
     */
    public static <T> ResponseResult<T> notFound(String message) {
        return new ResponseResult<>(404, message);
    }
    
    /**
     * 设置请求路径
     */
    public ResponseResult<T> path(String path) {
        this.path = path;
        return this;
    }
    
    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return this.code != null && this.code == 200;
    }
} 