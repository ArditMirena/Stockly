package com.stockly.service.command;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public interface InventoryLogCommandService {
    void logInventoryChange(com.stockly.model.enums.InventoryLogAction action,
                            Long warehouseId,
                            String warehouseName,
                            Long productId,
                            String productSku,
                            String productTitle,
                            Integer quantityChange,
                            Integer previousQuantity,
                            Integer newQuantity,
                            String referenceId,
                            String referenceType,
                            Long userId,
                            String userName,
                            String notes,
                            Map<String, Object> metadata);
    void logManualAdjustment(Long warehouseId, String warehouseName, Long productId,
                             String productSku, String productTitle, Integer adjustmentQuantity,
                             Integer previousQuantity, Integer newQuantity, Long userId,
                             String userName, String notes);
}
