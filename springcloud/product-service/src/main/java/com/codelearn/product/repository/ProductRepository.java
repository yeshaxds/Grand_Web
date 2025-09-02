package com.codelearn.product.repository;

import com.codelearn.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 产品数据访问层
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * 根据分类查找产品
     */
    List<Product> findByCategory(String category);
    
    /**
     * 根据产品名称模糊查询
     */
    List<Product> findByNameContaining(String name);
} 