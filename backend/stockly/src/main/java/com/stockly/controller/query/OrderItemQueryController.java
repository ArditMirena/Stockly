package com.stockly.controller.query;

import com.stockly.dto.OrderItemDTO;
import com.stockly.service.query.OrderItemQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
public class OrderItemQueryController {

    private final OrderItemQueryService orderItemQueryService;

    @GetMapping("/{id}")
    public OrderItemDTO getOrderItemById(@PathVariable Long id) {
        return orderItemQueryService.getOrderItemById(id);
    }

    @GetMapping
    public Page<OrderItemDTO> getAllOrderItems(Pageable pageable) {
        return orderItemQueryService.getAllOrderItems(pageable);
    }

    @GetMapping("/order/{orderId}")
    public List<OrderItemDTO> getOrderItemsByOrder(@PathVariable Long orderId) {
        return orderItemQueryService.getOrderItemsByOrder(orderId);
    }

    @GetMapping("/product/{productId}")
    public List<OrderItemDTO> getOrderItemsByProduct(@PathVariable Long productId) {
        return orderItemQueryService.getOrderItemsByProduct(productId);
    }

    @GetMapping("/product/{productId}/total-quantity")
    public Integer getProductTotalOrderedQuantity(@PathVariable Long productId) {
        return orderItemQueryService.getProductTotalOrderedQuantity(productId);
    }
}