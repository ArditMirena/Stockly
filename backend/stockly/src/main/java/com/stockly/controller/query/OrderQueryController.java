package com.stockly.controller.query;

import com.stockly.dto.OrderDTO;
import com.stockly.service.query.OrderQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderQueryController {

    private final OrderQueryService orderQueryService;

    @GetMapping("/{id}")
    public OrderDTO getOrderById(@PathVariable Long id) {
        return orderQueryService.getOrderById(id);
    }

    @GetMapping
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderQueryService.getAllOrders(pageable);
    }

    @GetMapping("/buyer/{buyerId}")
    public List<OrderDTO> getOrdersByBuyer(@PathVariable Long buyerId) {
        return orderQueryService.getOrdersByBuyer(buyerId);
    }

    @GetMapping("/supplier/{supplierId}")
    public List<OrderDTO> getOrdersBySupplier(@PathVariable Long supplierId) {
        return orderQueryService.getOrdersBySupplier(supplierId);
    }

    @GetMapping("/status/{status}")
    public List<OrderDTO> getOrdersByStatus(@PathVariable String status) {
        return orderQueryService.getOrdersByStatus(status);
    }

    @GetMapping("/date-range")
    public List<OrderDTO> getOrdersBetweenDates(
            @RequestParam Date start,
            @RequestParam Date end) {
        return orderQueryService.getOrdersBetweenDates(start, end);
    }

    @GetMapping("/supplier/{supplierId}/revenue")
    public BigDecimal getSupplierRevenue(@PathVariable Long supplierId) {
        return orderQueryService.getTotalRevenueBySupplier(supplierId);
    }
}