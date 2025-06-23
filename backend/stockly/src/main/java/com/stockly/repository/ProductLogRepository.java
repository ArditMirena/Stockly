package com.stockly.repository;

// ProductLogRepository.java

import com.stockly.model.ProductLogDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductLogRepository extends MongoRepository<ProductLogDocument, String> {
    List<ProductLogDocument> findByProductId(Long productId);
    Page<ProductLogDocument> findByProductId(Long productId, Pageable pageable);
    Page<ProductLogDocument> findByAction(String action, Pageable pageable);
    Page<ProductLogDocument> findAll(Pageable pageable);
}