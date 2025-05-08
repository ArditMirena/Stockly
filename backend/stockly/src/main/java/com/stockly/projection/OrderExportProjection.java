package com.stockly.projection;

import java.time.Instant;

public interface OrderExportProjection {
    Long getProductId();
    Long getWarehouseId();
    Instant getOrderDate();
    Integer getQuantity();
    Integer getCurrentStock();
}
