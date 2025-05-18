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

        Instant queryDate = (startDate != null) ? startDate : Instant.now().minus(30, ChronoUnit.DAYS);
        return ResponseEntity.ok(orderExportService.exportOrders(queryDate));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<OrderDTO>> getAllOrdersWithPagination(
            @RequestParam(value = "offset", required = false) Integer offset,
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "sortBy", required = false) String sortBy
    ) {
        if(null == offset) offset = 0;
        if(null == pageSize) pageSize = 10;
        if(StringUtils.isEmpty(sortBy)) sortBy = "id";
        return ResponseEntity.ok(orderQueryService.getAllOrdersWithPagination(PageRequest.of(offset, pageSize, Sort.by(sortBy))));
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrderDTO>> searchOrders(
            @RequestParam(required = false) String searchTerm
    ) {
        return ResponseEntity.ok(orderQueryService.searchOrders(searchTerm));
    }

}