package com.stockly.service.query;

import com.stockly.dto.ProductDTO;
import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.WarehouseProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface WarehouseQueryService {
    List<WarehouseDTO> getAllWarehouses();
    Optional<WarehouseDTO> getWarehouseById(Long id);
    List<WarehouseDTO> getWarehousesByCompanyId(Long companyId);
    boolean warehouseExistsByName(String name);
    List<WarehouseDTO> searchWarehouses(String searchTerm, Long companyId);
    Page<WarehouseDTO> getAllWarehousesWithPagination(Long companyId, Long managerId, Pageable pageable);
    Page<WarehouseDTO> getWarehousesByCompanyWithPagination(Long companyId, Pageable pageable);
    List<WarehouseProductDTO> getProductsByWarehouseId(Long id);

    Long getWarehousesCount();

}
