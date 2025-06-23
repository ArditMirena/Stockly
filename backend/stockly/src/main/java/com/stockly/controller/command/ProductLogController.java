package com.stockly.controller.command;
// ProductLogController.java


import com.stockly.model.ProductLogDocument;
import com.stockly.service.ProductLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-logs")
@RequiredArgsConstructor
public class ProductLogController {
    private final ProductLogService productLogService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductLogDocument>> getLogsByProduct(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(productLogService.getLogsByProductId(productId));
    }

    @GetMapping("/product/{productId}/page")
    public ResponseEntity<Page<ProductLogDocument>> getLogsByProductPaginated(
            @PathVariable Long productId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(productLogService.getLogsByProductId(productId, pageable));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<Page<ProductLogDocument>> getLogsByAction(
            @PathVariable String action,
            Pageable pageable
    ) {
        return ResponseEntity.ok(productLogService.getLogsByAction(action, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<ProductLogDocument>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(productLogService.getAllLogs(pageable));
    }
}