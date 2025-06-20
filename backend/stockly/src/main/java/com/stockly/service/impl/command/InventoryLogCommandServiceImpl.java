package com.stockly.service.impl.command;

import com.stockly.model.InventoryLog;
import com.stockly.model.enums.InventoryLogAction;
import com.stockly.repository.InventoryLogRepository;
import com.stockly.service.command.InventoryLogCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryLogCommandServiceImpl implements InventoryLogCommandService {

    private final InventoryLogRepository inventoryLogRepository;

    @Override
    public void logInventoryChange(InventoryLogAction action, Long warehouseId, String warehouseName,
                                   Long productId, String productSku, String productTitle,
                                   Integer quantityChange, Integer previousQuantity, Integer newQuantity,
                                   String referenceId, String referenceType,
                                   Long userId, String userName, String notes, Map<String, Object> metadata) {

        InventoryLog log = new InventoryLog();
        log.setWarehouseId(warehouseId);
        log.setWarehouseName(warehouseName);
        log.setProductId(productId);
        log.setProductSku(productSku);
        log.setProductTitle(productTitle);
        log.setActionType(action.name());
        log.setQuantityChange(quantityChange);
        log.setPreviousQuantity(previousQuantity);
        log.setNewQuantity(newQuantity);
        log.setSource("SYSTEM");
        log.setReferenceId(referenceId);
        log.setReferenceType(referenceType);
        log.setUserId(userId);
        log.setUserName(userName);
        log.setNotes(notes);
        log.setTimestamp(Instant.now());
        log.setMetadata(metadata);

        inventoryLogRepository.save(log);
    }

    @Override
    public void logManualAdjustment(Long warehouseId, String warehouseName, Long productId,
                                    String productSku, String productTitle, Integer adjustmentQuantity,
                                    Integer previousQuantity, Integer newQuantity, Long userId,
                                    String userName, String notes) {

        logInventoryChange(
                InventoryLogAction.ADJUSTMENT,
                warehouseId, warehouseName,
                productId, productSku, productTitle,
                adjustmentQuantity, previousQuantity, newQuantity,
                null, "MANUAL_ADJUSTMENT",
                userId, userName, notes, null
        );
    }
}
