package com.stockly.controller.command;

import com.stockly.dto.OrderItemDTO;
import com.stockly.mapper.OrderItemMapper;
import com.stockly.model.OrderItem;
import com.stockly.service.command.OrderItemCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
public class OrderItemCommandController {

    private final OrderItemCommandService orderItemCommandService;
    private final OrderItemMapper orderItemMapper;

    @PostMapping("/orders/{orderId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItemDTO createOrderItem(
            @PathVariable Long orderId,
            @RequestBody @Valid OrderItemDTO orderItemDTO) {

        OrderItem createdItem = orderItemCommandService.createOrderItem(orderId, orderItemDTO);
        return orderItemMapper.toDto(createdItem);
    }

    @PutMapping("/{id}")
    public OrderItem updateOrderItem(
            @PathVariable Long id,
            @RequestBody @Valid OrderItemDTO orderItemDTO) {
        return orderItemCommandService.updateOrderItem(id, orderItemDTO);
    }

    @PatchMapping("/{id}/quantity/{quantity}")
    public void updateOrderItemQuantity(
            @PathVariable Long id,
            @PathVariable Integer quantity) {
        orderItemCommandService.updateOrderItemQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrderItem(@PathVariable Long id) {
        orderItemCommandService.deleteOrderItem(id);
    }

    @DeleteMapping("/order/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllByOrderId(@PathVariable Long orderId) {
        orderItemCommandService.deleteAllByOrderId(orderId);
    }
}