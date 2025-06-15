package com.stockly.controller.query;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.OrderExportDTO;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.service.impl.query.OrderExportService;
import com.stockly.service.impl.query.StockCalculationService;
import com.stockly.service.query.OrderQueryService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderQueryController {

    private final OrderQueryService orderQueryService;
    private final OrderRepository orderRepository;
    private final WarehouseProductRepository warehouseProductRepository;
    private final StockCalculationService stockCalculationService;
    private final OrderExportService orderExportService;

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



    @GetMapping("/export")
    public ResponseEntity<List<OrderExportDTO>> exportOrders(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant startDate) {

        Instant queryDate = (startDate != null) ? startDate : Instant.now().minus(365, ChronoUnit.DAYS);
        return ResponseEntity.ok(orderExportService.exportOrders(queryDate));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<OrderDTO>> getAllOrdersWithPagination(
            @RequestParam(value = "offset", defaultValue = "0") Integer offset,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "buyerManagerId", required = false) Long buyerManagerId,
            @RequestParam(value = "supplierManagerId", required = false) Long supplierManagerId,
            @RequestParam(value = "managerId", required = false) Long managerId,
            @RequestParam(value = "buyerCompanyId", required = false) Long buyerCompanyId,
            @RequestParam(value = "supplierCompanyId", required = false) Long supplierCompanyId,
            @RequestParam(value = "sourceWarehouseId", required = false) Long sourceWarehouseId,
            @RequestParam(value = "destinationWarehouseId", required = false) Long destinationWarehouseId,
            @RequestParam(required = false) String searchTerm
    ) {
        PageRequest pageRequest = PageRequest.of(offset, pageSize, Sort.by(sortBy));
        Page<OrderDTO> orders = orderQueryService.getAllOrdersWithPagination(
                pageRequest,
                buyerManagerId,
                supplierManagerId,
                managerId,
                buyerCompanyId,
                supplierCompanyId,
                sourceWarehouseId,
                destinationWarehouseId,
                searchTerm
        );
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getOrderCount() {
        return ResponseEntity.ok(orderQueryService.getOrdersCount());
    }
}