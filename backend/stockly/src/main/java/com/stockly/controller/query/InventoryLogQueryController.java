package com.stockly.controller.query;

import com.stockly.model.InventoryLog;
import com.stockly.service.query.InventoryLogQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory-logs")
@RequiredArgsConstructor
public class InventoryLogQueryController {

    private final InventoryLogQueryService inventoryLogQueryService;

    @GetMapping("/warehouse/{warehouseId}")
    public Page<InventoryLog> getLogsByWarehouse(
            @PathVariable Long warehouseId,
            @PageableDefault(size = 10) Pageable pageable) {
        return inventoryLogQueryService.getLogsByWarehouse(warehouseId, pageable);
    }

    @GetMapping("/product/{productId}")
    public Page<InventoryLog> getLogsByProduct(
            @PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable) {
        return inventoryLogQueryService.getLogsByProduct(productId, pageable);
    }

    @GetMapping("/warehouse/{warehouseId}/product/{productId}")
    public Page<InventoryLog> getLogsByWarehouseAndProduct(
            @PathVariable Long warehouseId,
            @PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable) {
        return inventoryLogQueryService.getLogsByWarehouseAndProduct(warehouseId, productId, pageable);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<InventoryLog>> getInventoryLogsWithPagination(
            @RequestParam(value = "offset", defaultValue = "0") Integer offset,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "timestamp") String sortBy,
            @RequestParam(value = "direction", defaultValue = "desc") String direction,
            @RequestParam(value = "warehouseId", required = false) Long warehouseId,
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "actionType", required = false) String actionType,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(value = "searchTerm", required = false) String searchTerm) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(offset, pageSize, sort);

        return ResponseEntity.ok(inventoryLogQueryService.getInventoryLogsWithPagination(
                pageRequest,
                warehouseId,
                productId,
                actionType,
                source,
                userId,
                startDate,
                endDate,
                searchTerm
        ));
    }

    @GetMapping("/time-range")
    public Page<InventoryLog> getLogsByTimeRange(
            @RequestParam Instant start,
            @RequestParam Instant end,
            @PageableDefault(size = 10) Pageable pageable) {
        return inventoryLogQueryService.getLogsByTimeRange(start, end, pageable);
    }

    @GetMapping("/recent/{warehouseId}")
    public List<InventoryLog> getRecentActivity(
            @PathVariable Long warehouseId,
            @RequestParam(defaultValue = "10") int limit) {
        return inventoryLogQueryService.getRecentActivity(warehouseId, limit);
    }
}