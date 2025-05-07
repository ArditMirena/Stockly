package com.stockly.controller.command;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.request.OrderRequest;
import com.stockly.model.Order;
import com.stockly.service.command.OrderCommandService;
import com.stockly.service.impl.command.OrderProcessingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderCommandController {

    private final OrderCommandService orderCommandService;
    private final OrderProcessingService orderProcessingService;

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

    @PostMapping("/process")
    public ResponseEntity<OrderDTO> processOrder(@Valid @RequestBody OrderRequest request) {
        OrderDTO orderDTO = orderProcessingService.processOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
    }
}