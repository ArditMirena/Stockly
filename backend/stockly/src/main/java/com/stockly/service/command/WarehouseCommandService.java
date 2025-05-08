package com.stockly.service.command;

import com.stockly.dto.WarehouseDTO;

public interface WarehouseCommandService {
    WarehouseDTO createWarehouse(WarehouseDTO warehouseDTO);
    WarehouseDTO updateWarehouse(Long id, WarehouseDTO warehouseDTO);
    void deleteWarehouse(Long id);

    void assignProductToWarehouse(Long productId, Integer quantity, Long warehouseId);

}
