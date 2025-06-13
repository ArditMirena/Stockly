package com.stockly.controller.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.WarehouseProduct;
import com.stockly.service.command.WarehouseProductCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/warehouse-products")
@RequiredArgsConstructor
public class WarehouseProductCommandController {
    private final WarehouseProductCommandService warehouseProductCommandService;

    @PostMapping
    public ResponseEntity<WarehouseProduct> createWarehouseProduct(@RequestBody WarehouseProductDTO warehouseProduct) {
        return ResponseEntity.ok(warehouseProductCommandService.createWarehouseProduct(warehouseProduct));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseProduct> updateWarehouseProduct(@PathVariable Long id, @RequestBody WarehouseProductDTO warehouseProduct) {
        return ResponseEntity.ok(warehouseProductCommandService.updateWarehouseProduct(id, warehouseProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouseProduct(@PathVariable Long id) {
        warehouseProductCommandService.deleteWarehouseProduct(id);
        return ResponseEntity.noContent().build();
    }
}
