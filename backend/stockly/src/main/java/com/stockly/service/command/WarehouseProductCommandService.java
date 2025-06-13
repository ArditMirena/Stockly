package com.stockly.service.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.WarehouseProduct;


public interface WarehouseProductCommandService {
    WarehouseProduct createWarehouseProduct(WarehouseProductDTO warehouseProductDTO);
    WarehouseProduct updateWarehouseProduct(Long id, WarehouseProductDTO warehouseProductDTO);
    void deleteWarehouseProduct(Long id);
    void assignProductToWarehouse(WarehouseProductDTO warehouseProductDTO);
}
