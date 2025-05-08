package com.stockly.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record WarehouseStockDTO(
        Long productId,
        Long warehouseId,
        Instant timestamp,
        Integer quantityChange,
        Integer currentStock,
        String changeType
) {}
