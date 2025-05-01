package com.stockly.controller.query;

import com.stockly.dto.WarehouseDTO;
import com.stockly.model.Product;
import com.stockly.service.command.WarehouseProductService;
import com.stockly.service.query.WarehouseQueryService;
import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    @GetMapping("/exists/name/{name}")
    public boolean warehouseExistsByName(@PathVariable String name) {
        return warehouseQueryService.warehouseExistsByName(name);
    }

    @GetMapping("/search")
    public ResponseEntity<List<WarehouseDTO>> searchWarehouses(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long companyId
    ) {
        return ResponseEntity.ok(warehouseQueryService.searchWarehouses(searchTerm, companyId));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<WarehouseDTO>> getAllWarehousesWithPagination(
            @RequestParam(value = "offset", required = false) Integer offset,
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "companyId", required = false) Long companyId
    ) {
        if(null == offset) offset = 0;
        if(null == pageSize) pageSize = 10;
        if(StringUtils.isEmpty(sortBy)) sortBy = "id";

        if(companyId != null) {
            return ResponseEntity.ok(warehouseQueryService.getWarehousesByCompanyWithPagination(
                    companyId,
                    PageRequest.of(offset, pageSize, Sort.by(sortBy))
            ));
        } else {
            return ResponseEntity.ok(warehouseQueryService.getAllWarehousesWithPagination(
                    PageRequest.of(offset, pageSize, Sort.by(sortBy))
            ));
        }
    }
}
