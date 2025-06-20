package com.stockly.service.impl.query;

import com.stockly.model.InventoryLog;
import com.stockly.repository.InventoryLogRepository;
import com.stockly.service.query.InventoryLogQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryLogQueryServiceImpl implements InventoryLogQueryService {

    private final InventoryLogRepository inventoryLogRepository;

    @Override
    public Page<InventoryLog> getLogsByWarehouse(Long warehouseId, Pageable pageable) {
        return inventoryLogRepository.findByWarehouseId(warehouseId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByProduct(Long productId, Pageable pageable) {
        return inventoryLogRepository.findByProductId(productId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByWarehouseAndProduct(Long warehouseId, Long productId, Pageable pageable) {
        return inventoryLogRepository.findByWarehouseIdAndProductId(warehouseId, productId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByTimeRange(Instant start, Instant end, Pageable pageable) {
        return inventoryLogRepository.findByTimestampBetween(start, end, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByActionType(String actionType, Pageable pageable) {
        return inventoryLogRepository.findByActionType(actionType, pageable);
    }

    @Override
    public List<InventoryLog> getRecentActivity(Long warehouseId, int limit) {
        return inventoryLogRepository.findByWarehouseIdOrderByTimestampDesc(warehouseId, PageRequest.of(0, limit));
    }

    @Override
    public InventoryLog getLastRestockForProduct(Long warehouseId, Long productId) {
        return inventoryLogRepository.findFirstByWarehouseIdAndProductIdAndActionTypeOrderByTimestampDesc(
                warehouseId, productId, "RESTOCK");
    }
}