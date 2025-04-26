package com.stockly.controller.query;

import com.stockly.dto.WarehouseDTO;
import com.stockly.model.Product;
import com.stockly.service.command.WarehouseProductService;
import com.stockly.service.query.WarehouseQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouses")

public class WarehouseQueryController {

    private final WarehouseQueryService warehouseQueryService;
    @Autowired
    private WarehouseProductService warehouseProductService;

    public WarehouseQueryController(WarehouseQueryService warehouseQueryService) {
        this.warehouseQueryService = warehouseQueryService;
    }

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        List<WarehouseDTO> warehouses = warehouseQueryService.getAllWarehouses();
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.of(warehouseQueryService.getWarehouseById(id));
    }

    @GetMapping("/{warehouseId}/products")
    public ResponseEntity<List<Product>> getProductsByWarehouse(@PathVariable Long warehouseId, @RequestParam String availability) {
        List<Product> products = warehouseProductService.getProductsByWarehouseAndAvailability(warehouseId, availability);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<WarehouseDTO>> getWarehousesByCompany(@PathVariable Long companyId) {
        List<WarehouseDTO> warehouses = warehouseQueryService.getWarehousesByCompanyId(companyId);
        return ResponseEntity.ok(warehouses);
    }
}
