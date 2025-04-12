package com.stockly.service.command;

import com.stockly.dto.OrderDTO;
import com.stockly.model.Order;

public interface OrderCommandService {
    Order createOrder(OrderDTO orderDTO);
    Order updateOrder(Long id, OrderDTO orderDTO);
    void updateOrderStatus(Long id, String status);
    void cancelOrder(Long id);
    void deleteOrder(Long id);
}