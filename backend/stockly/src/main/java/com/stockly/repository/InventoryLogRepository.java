package com.stockly.repository;

import com.stockly.model.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface InventoryLogRepository extends MongoRepository<InventoryLog, String> {
    Page<InventoryLog> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<InventoryLog> findByProductId(Long productId, Pageable pageable);
    Page<InventoryLog> findByWarehouseIdAndProductId(Long warehouseId, Long productId, Pageable pageable);
    Page<InventoryLog> findByTimestampBetween(Instant start, Instant end, Pageable pageable);
    Page<InventoryLog> findByActionType(String actionType, Pageable pageable);
    List<InventoryLog> findByWarehouseIdOrderByTimestampDesc(Long warehouseId, Pageable pageable);
    InventoryLog findFirstByWarehouseIdAndProductIdAndActionTypeOrderByTimestampDesc(
            Long warehouseId, Long productId, String actionType);
}
