package com.stockly.service.command;

import com.stockly.dto.WarehouseProductDTO;



public interface WarehouseProductCommandService {
    void assignProductToWarehouse(WarehouseProductDTO warehouseProductDTO);
}
