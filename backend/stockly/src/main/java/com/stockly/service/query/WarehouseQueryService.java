package com.stockly.service.query;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface WarehouseQueryService {
    List<WarehouseDTO> getAllWarehouses();
    Optional<WarehouseDTO> getWarehouseById(Long id);
    List<WarehouseDTO> getWarehousesByCompanyId(Long companyId);
    boolean warehouseExistsByName(String name);
    List<WarehouseDTO> searchWarehouses(String searchTerm, Long companyId);
    Page<WarehouseDTO> getAllWarehousesWithPagination(PageRequest pageRequest, Long companyId, Long managerId, Boolean isActive,String searchTerm);
    List<WarehouseProductDTO> getProductsByWarehouseId(Long id);
    List<WarehouseDTO> getWarehousesByManagerId(Long managerId);
    Long getWarehousesCount();

}
