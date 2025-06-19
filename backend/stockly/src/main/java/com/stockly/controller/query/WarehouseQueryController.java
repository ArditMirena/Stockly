package com.stockly.controller.query;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.WarehouseProductService;
import com.stockly.service.query.WarehouseProductQueryService;
import com.stockly.service.query.WarehouseQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouses")
@RequiredArgsConstructor
public class WarehouseQueryController {

    private final WarehouseQueryService warehouseQueryService;
    @Autowired
    private WarehouseProductService warehouseProductService;
    @Autowired
    private WarehouseRepository warehouseRepository;
    private final WarehouseProductQueryService warehouseProductQueryService;

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
    public ResponseEntity<List<WarehouseProductDTO>> getProductsByWarehouse(@PathVariable Long warehouseId) {
        List<WarehouseProductDTO> products = warehouseQueryService.getProductsByWarehouseId(warehouseId);
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
            @RequestParam(value = "offset", defaultValue = "0") Integer offset,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", defaultValue = "asc") String direction,
            @RequestParam(value = "companyId", required = false) Long companyId,
            @RequestParam(value = "managerId", required = false) Long managerId,
            @RequestParam(value = "isActive", required = false, defaultValue = "true") Boolean isActive,
            @RequestParam(value = "searchTerm", required = false) String searchTerm
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(offset, pageSize, sort);

        return ResponseEntity.ok(warehouseQueryService.getAllWarehousesWithPagination(
                pageRequest,
                companyId,
                managerId,
                isActive,
                searchTerm
        ));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getWarehouseCount() {
        return ResponseEntity.ok(warehouseQueryService.getWarehousesCount());
    }

    @GetMapping("/products/page")
    public ResponseEntity<Page<WarehouseProductDTO>> getProductsByWarehouseWithPagination(
            @RequestParam(value = "offset", defaultValue = "0") Integer offset,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "direction", defaultValue = "asc") String direction,
            @RequestParam(value = "warehouseId", required = false) Long warehouseId,
            @RequestParam(value = "searchTerm", required = false) String searchTerm
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(offset, pageSize, sort);

        return ResponseEntity.ok(warehouseProductQueryService.getAllWarehouseProductsWithPagination(
                pageRequest,
                warehouseId,
                searchTerm
        ));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<WarehouseDTO>> getWarehousesByManagerId(
            @PathVariable Long managerId
    ) {
        List<WarehouseDTO> warehouses = warehouseQueryService.getWarehousesByManagerId(managerId);
        return ResponseEntity.ok(warehouses);
    }
    
}
