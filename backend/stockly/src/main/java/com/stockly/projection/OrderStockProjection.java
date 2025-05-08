package com.stockly.projection;

import java.time.Instant;

public interface OrderStockProjection {
    Long getProductId();
    Long getWarehouseId();
    Instant getOrderDate();
    Integer getQuantity();
    Integer getStockAtTime();
}
