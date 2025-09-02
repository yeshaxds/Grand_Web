package com.codelearn.product.service;

import com.codelearn.product.entity.Product;
import com.codelearn.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 产品服务层
 */
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * 获取所有产品
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    /**
     * 根据ID获取产品
     */
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    /**
     * 根据分类获取产品
     */
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
    
    /**
     * 根据名称搜索产品
     */
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContaining(name);
    }
    
    /**
     * 保存产品
     */
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    
    /**
     * 删除产品
     */
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    /**
     * 更新产品
     */
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("产品不存在: " + id));
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setCategory(productDetails.getCategory());
        
        return productRepository.save(product);
    }
} 