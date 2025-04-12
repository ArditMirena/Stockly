package com.stockly.controller.command;

import com.stockly.dto.OrderDTO;
import com.stockly.model.Order;
import com.stockly.service.command.OrderCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderCommandController {

    private final OrderCommandService orderCommandService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@RequestBody @Valid OrderDTO orderDTO) {
        return orderCommandService.createOrder(orderDTO);
    }

    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody @Valid OrderDTO orderDTO) {
        return orderCommandService.updateOrder(id, orderDTO);
    }

    @PatchMapping("/{id}/status/{status}")
    public void updateOrderStatus(@PathVariable Long id, @PathVariable String status) {
        orderCommandService.updateOrderStatus(id, status);
    }

    @PatchMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable Long id) {
        orderCommandService.cancelOrder(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long id) {
        orderCommandService.deleteOrder(id);
    }
}