package com.codelearn.repository;

import com.codelearn.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户仓库接口
 * 继承JpaRepository，提供基本的CRUD操作
 * 演示Spring Data JPA的查询方法
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 根据用户名查找用户
     * Spring Data JPA 会根据方法名自动生成查询
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 根据用户名和邮箱查找用户
     */
    Optional<User> findByUsernameAndEmail(String username, String email);
    
    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);
    
    /**
     * 根据状态查找用户列表
     */
    List<User> findByStatus(Integer status);
    
    /**
     * 根据角色查找用户列表
     */
    List<User> findByRole(User.UserRole role);
    
    /**
     * 根据用户名模糊查询（分页）
     * 方法名查询：包含指定字符串的用户名
     */
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    
    /**
     * 使用@Query注解自定义查询
     * 查找活跃用户（状态为1）
     */
    @Query("SELECT u FROM User u WHERE u.status = 1")
    List<User> findActiveUsers();
    
    /**
     * 使用@Query注解和参数查询
     * 根据角色和状态查找用户
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status")
    List<User> findByRoleAndStatus(@Param("role") User.UserRole role, @Param("status") Integer status);
    
    /**
     * 原生SQL查询
     * 统计用户总数
     */
    @Query(value = "SELECT COUNT(*) FROM users", nativeQuery = true)
    Long countTotalUsers();
    
    /**
     * 复杂查询：根据用户名或邮箱模糊搜索用户
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchActiveUsers(@Param("keyword") String keyword, Pageable pageable);
} 