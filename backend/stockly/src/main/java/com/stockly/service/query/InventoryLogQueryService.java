package com.stockly.service.query;

import com.stockly.model.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface InventoryLogQueryService {
    Page<InventoryLog> getLogsByWarehouse(Long warehouseId, Pageable pageable);
    Page<InventoryLog> getLogsByProduct(Long productId, Pageable pageable);
    Page<InventoryLog> getLogsByWarehouseAndProduct(Long warehouseId, Long productId, Pageable pageable);
    Page<InventoryLog> getLogsByTimeRange(Instant start, Instant end, Pageable pageable);
    Page<InventoryLog> getLogsByActionType(String actionType, Pageable pageable);
    List<InventoryLog> getRecentActivity(Long warehouseId, int limit);
    InventoryLog getLastRestockForProduct(Long warehouseId, Long productId);
}
