package com.stockly.service.query;

import com.stockly.dto.OrderItemDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderItemQueryService {
    OrderItemDTO getOrderItemById(Long id);
    List<OrderItemDTO> getOrderItemsByOrder(Long orderId);
    List<OrderItemDTO> getOrderItemsByProduct(Long productId);
    Page<OrderItemDTO> getAllOrderItems(Pageable pageable);
    Integer getProductTotalOrderedQuantity(Long productId);
}