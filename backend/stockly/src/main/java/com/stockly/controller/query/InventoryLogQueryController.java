package com.stockly.controller.query;

import com.stockly.model.InventoryLog;
import com.stockly.service.query.InventoryLogQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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