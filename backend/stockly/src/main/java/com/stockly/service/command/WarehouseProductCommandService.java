package com.stockly.service.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.dto.WarehouseProductExcelDTO;
import com.stockly.model.WarehouseProduct;

import java.util.List;


public interface WarehouseProductCommandService {
    WarehouseProduct createWarehouseProduct(WarehouseProductDTO warehouseProductDTO);
    WarehouseProduct updateWarehouseProduct(Long id, WarehouseProductDTO warehouseProductDTO);
    void deleteWarehouseProduct(Long id);
    void assignProductToWarehouse(WarehouseProductDTO warehouseProductDTO);
    WarehouseProduct importWarehouseProductFromExcel(WarehouseProductExcelDTO dto);
    List<WarehouseProduct> importWarehouseProductsFromExcel(List<WarehouseProductExcelDTO> importList);
}
