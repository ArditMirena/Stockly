package com.stockly.projection;

import java.time.Instant;


public interface StockChangeProjection {
    Long getProductId();
    Long getWarehouseId();
    Instant getTimestamp();
    Integer getQuantityChange();
    String getChangeType();

}