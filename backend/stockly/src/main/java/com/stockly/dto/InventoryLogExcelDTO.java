package com.stockly.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class InventoryLogExcelDTO {
    private String warehouseName;
    private String productSku;
    private String productTitle;
    private String actionType;
    private Integer quantityChange;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String source;
    private String referenceType;
    private String referenceId;
    private String userName;
    private String notes;
    private Instant timestamp;
}