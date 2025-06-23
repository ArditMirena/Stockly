package com.stockly.repository;
// WarehouseLogRepository.java

import com.stockly.model.WarehouseLogDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WarehouseLogRepository extends MongoRepository<WarehouseLogDocument, String> {
    List<WarehouseLogDocument> findByWarehouseId(Long warehouseId);
    Page<WarehouseLogDocument> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<WarehouseLogDocument> findByAction(String action, Pageable pageable);
    Page<WarehouseLogDocument> findAll(Pageable pageable);
}