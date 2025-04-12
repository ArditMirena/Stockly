package com.stockly.service.command;

import com.stockly.dto.OrderItemDTO;
import com.stockly.model.OrderItem;

public interface OrderItemCommandService {
    OrderItem createOrderItem(Long orderId, OrderItemDTO dto);
    OrderItem updateOrderItem(Long id, OrderItemDTO dto);
    void updateOrderItemQuantity(Long id, Integer quantity);
    void deleteOrderItem(Long id);
    void deleteAllByOrderId(Long orderId);
}