package com.stockly.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "inventory_logs")
@Data
public class InventoryLog {
    @Id
    private String id;
    private Long warehouseId;
    private String warehouseName;
    private Long productId;
    private String productSku;
    private String productTitle;
    private String actionType; // RESTOCK, ORDER, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
    private Integer quantityChange;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String source; // SYSTEM, MANUAL, API, IMPORT
    private String referenceId; // Order ID, Receipt ID, etc.
    private String referenceType; // ORDER, RECEIPT, ADJUSTMENT, etc.
    private Long userId; // Who performed the action
    private String userName;
    private String notes;
    private Instant timestamp;
    private Map<String, Object> metadata; // Additional context data
}