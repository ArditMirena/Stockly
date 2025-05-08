package com.stockly.projection;

import java.time.Instant;

public interface FlatOrderProjection {
    Long getOrderId();
    Long getWarehouseId();
    Instant getOrderDate();
    Long getProductId();
    Integer getQuantity();
}
