package com.stockly.projection;

import java.time.Instant;
import java.util.List;

public interface OrderProjection {
    Long getOrderId();
    Long getWarehouseId();
    Instant getOrderDate();
    List<OrderItemProjection> getItems();
}
