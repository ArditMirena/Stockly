package com.stockly.controller.query;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.OrderExportDTO;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.service.impl.query.StockCalculationService;
import com.stockly.service.query.OrderQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderQueryController {

    private final OrderQueryService orderQueryService;
    private final OrderRepository orderRepository;
    private final WarehouseProductRepository warehouseProductRepository;
    private final StockCalculationService stockCalculationService;

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



//    @GetMapping("/export")
//    public List<OrderExportDTO> exportOrders() {
//        // Get complete stock history
//        List<WarehouseStockDTO> stockHistory = stockCalculationService.calculateStockHistory();
//
//        // Create timeline of stock levels
//        Map<Pair<Long, Long>, TreeMap<Instant, Integer>> stockTimeline = new HashMap<>();
//
//        for (WarehouseStockDTO dto : stockHistory) {
//            Pair<Long, Long> key = Pair.of(dto.productId(), dto.warehouseId());
//            stockTimeline.computeIfAbsent(key, k -> new TreeMap<>())
//                    .put(dto.timestamp(), dto.currentStock());
//        }
//
//        // Process orders
//        return orderRepository.findAll().stream()
//                .flatMap(order -> order.getItems().stream()
//                        .map(item -> {
//                            Pair<Long, Long> key = Pair.of(
//                                    item.getProduct().getId(),
//                                    order.getWarehouse().getId()
//                            );
//
//                            // Correct stock level lookup
//                            Integer stockBeforeOrder = Optional.ofNullable(stockTimeline.get(key))
//                                    .map(timeline -> {
//                                        Map.Entry<Instant, Integer> entry = timeline.floorEntry(order.getOrderDate());
//                                        return entry != null ? entry.getValue() : 0;
//                                    })
//                                    .orElse(0);
//
//                            return new OrderExportDTO(
//                                    item.getProduct().getId(),
//                                    order.getWarehouse().getId(),
//                                    order.getOrderDate(),
//                                    item.getQuantity(),
//                                    stockBeforeOrder
//                            );
//                        })
//                )
//                .collect(Collectors.toList());
//    }


    @GetMapping("/export")
    public List<OrderExportDTO> exportOrders() {
        Instant startDate = Instant.now().minus(30, ChronoUnit.DAYS);
        return orderRepository.findOrdersForExport(startDate).stream()
                .map(projection -> new OrderExportDTO(
                        projection.getProductId(),
                        projection.getWarehouseId(),
                        projection.getOrderDate(),
                        projection.getQuantity(),
                        projection.getCurrentStock()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<OrderDTO>> searchOrders(
            @RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                orderQueryService.searchOrders(
                        buyerId,
                        supplierId,
                        status,
                        startDate,
                        endDate,
                        PageRequest.of(page, size)
                )
        );


    }

}