package com.stockly.dto;

import java.time.Instant;

public record OrderExportDTO(
        Long productId,
        Long warehouseId,
        Instant orderDate,
        Integer quantity,
        Integer currentStock
) {
    public OrderExportDTO(Long productId, Long warehouseId, Instant orderDate,
                          Integer quantity, Integer currentStock) {
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.orderDate = orderDate;
        this.quantity = quantity;
        this.currentStock = currentStock;
    }
}