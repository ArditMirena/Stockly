package com.stockly.service.query;

import com.stockly.dto.WarehouseProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public interface WarehouseProductQueryService {
    Page<WarehouseProductDTO> getAllWarehouseProductsWithPagination(PageRequest pageRequest);
    Page<WarehouseProductDTO> getWarehouseProductsWithFilters(
            Long warehouseId,
            Long managerId,
            Pageable pageable
    );
}
