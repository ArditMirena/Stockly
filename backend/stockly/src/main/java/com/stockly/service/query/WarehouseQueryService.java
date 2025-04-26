package com.stockly.service.query;

import com.stockly.dto.WarehouseDTO;

import java.util.List;
import java.util.Optional;

public interface WarehouseQueryService {
    List<WarehouseDTO> getAllWarehouses();
    Optional<WarehouseDTO> getWarehouseById(Long id);
    List<WarehouseDTO> getWarehousesByCompanyId(Long companyId);
}
