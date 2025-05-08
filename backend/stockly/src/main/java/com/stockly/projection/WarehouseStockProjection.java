package com.stockly.projection;

public interface WarehouseStockProjection {
    Long getProductId();
    Long getWarehouseId();
    Integer getCurrentStock();
}
