package com.stockly.service.query;

import com.stockly.dto.WarehouseProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface WarehouseProductQueryService {
    Page<WarehouseProductDTO> getAllWarehouseProductsWithPagination(PageRequest pageRequest);
}
