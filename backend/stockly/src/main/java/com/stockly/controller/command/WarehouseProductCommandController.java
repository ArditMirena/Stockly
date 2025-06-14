package com.stockly.controller.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.dto.WarehouseProductExcelDTO;
import com.stockly.model.WarehouseProduct;
import com.stockly.service.ExcelParserService;
import com.stockly.service.command.WarehouseProductCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouse-products")
@RequiredArgsConstructor
public class WarehouseProductCommandController {
    private final WarehouseProductCommandService warehouseProductCommandService;
    private final ExcelParserService excelParserService;

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

    @PostMapping("/import-warehouse-products")
    public ResponseEntity<?> importWarehouseProducts(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Empty file uploaded.");
        }

        try {
            List<WarehouseProductExcelDTO> excelData = excelParserService.parseWarehouseProductExcel(file);
            List<WarehouseProduct> imported = warehouseProductCommandService.importWarehouseProductsFromExcel(excelData);
            return ResponseEntity.ok("Successfully imported " + imported.size() + " warehouse products.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Import failed: " + e.getMessage());
        }
    }
}
