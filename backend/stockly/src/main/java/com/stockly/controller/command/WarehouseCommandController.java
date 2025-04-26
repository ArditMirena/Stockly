package com.stockly.controller.command;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.service.command.WarehouseCommandService;
import com.stockly.service.command.WarehouseProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.stockly.service.command.WarehouseProductCommandService;

@RestController
@RequestMapping("/api/v1/warehouses")

public class WarehouseCommandController {

    private final WarehouseCommandService warehouseCommandService;
    @Autowired
    private WarehouseProductService warehouseProductService;
    private final WarehouseProductCommandService warehouseProductCommandService;

    @Autowired
    public WarehouseCommandController(WarehouseCommandService warehouseCommandService,
                                      WarehouseProductCommandService warehouseProductCommandService) {
        this.warehouseCommandService = warehouseCommandService;
        this.warehouseProductCommandService = warehouseProductCommandService; // Inject the service
    }

    @PostMapping
    public ResponseEntity<WarehouseDTO> createWarehouse(@RequestBody WarehouseDTO warehouseDTO) {
        WarehouseDTO createdWarehouse = warehouseCommandService.createWarehouse(warehouseDTO);
        return new ResponseEntity<>(createdWarehouse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @RequestBody WarehouseDTO warehouseDTO) {
        WarehouseDTO updatedWarehouse = warehouseCommandService.updateWarehouse(id, warehouseDTO);
        return new ResponseEntity<>(updatedWarehouse, HttpStatus.OK);
    }


    @PutMapping("/warehouse/{warehouseId}/product/{productId}")
    public ResponseEntity<String> updateProductAvailability(@PathVariable Long warehouseId,
                                                            @PathVariable Long productId,
                                                            @RequestBody String availability) {
        warehouseProductService.updateProductAvailability(warehouseId, productId, availability);
        return ResponseEntity.ok("Availability updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseCommandService.deleteWarehouse(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
//    @PostMapping("/assign-product")
//    public ResponseEntity<String> assignProductToWarehouse(@RequestBody WarehouseProductDTO warehouseProductDTO) {
//        // Use the injected service to assign the product to the warehouse
//        warehouseCommandService.assignProductToWarehouse(warehouseProductDTO);
//        return ResponseEntity.ok("Product assigned to warehouse successfully.");
//    }

    @PostMapping("/assign-product/{productId}/{quantity}/towarehouse/{warehouseId}")
    public ResponseEntity<Void> assignProductToWarehouse(@PathVariable Long productId,
                                                                 @PathVariable Integer quantity,
                                                                 @PathVariable Long warehouseId) {
        warehouseCommandService.assignProductToWarehouse(productId, warehouseId, quantity);
        return new ResponseEntity<>(HttpStatus.OK);
    }






}
