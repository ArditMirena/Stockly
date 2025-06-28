package com.stockly.controller.query;

import com.stockly.model.InventoryLog;
import com.stockly.service.InventoryLogExportService;
import com.stockly.service.query.InventoryLogQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/inventory-logs")
@RequiredArgsConstructor
public class InventoryLogQueryController {

    private final InventoryLogQueryService inventoryLogQueryService;
    private final InventoryLogExportService inventoryLogExportService;

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




    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportInventoryLogsToExcel(
            @RequestParam(value = "warehouseId", required = false) Long warehouseId,
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "actionType", required = false) String actionType,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(value = "searchTerm", required = false) String searchTerm) {

        try {
            // Get all logs (without pagination) based on filters
            Page<InventoryLog> logs = inventoryLogQueryService.getInventoryLogsWithPagination(
                    Pageable.unpaged(),
                    warehouseId,
                    productId,
                    actionType,
                    source,
                    userId,
                    startDate,
                    endDate,
                    searchTerm
            );

            ByteArrayInputStream in = inventoryLogExportService.exportToExcel(logs);
            byte[] bytes = in.readAllBytes();

            if (bytes == null || bytes.length < 1024) { // Simple check for small file size
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=no_data.xlsx")
                        .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                        .body(new ByteArrayResource("No inventory logs found matching the criteria".getBytes()));
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_logs.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new ByteArrayResource(bytes));
        } catch (Exception e) {
            log.error("Failed to export inventory logs to Excel", e);
            return ResponseEntity.internalServerError()
                    .body(new ByteArrayResource("Failed to generate Excel export".getBytes()));
        }
    }
}