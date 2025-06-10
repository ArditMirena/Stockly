package com.stockly.service.impl.query;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.mapper.WarehouseProductMapper;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.PredictionResultRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.service.query.WarehouseProductQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseProductQueryServiceImpl implements WarehouseProductQueryService {
    private final WarehouseProductRepository warehouseProductRepository;
    private final WarehouseProductMapper warehouseProductMapper;
    private final PredictionResultRepository predictionResultRepository;

    @Override
    public Page<WarehouseProductDTO> getAllWarehouseProductsWithPagination(PageRequest pageRequest) {
        Page<WarehouseProduct> warehouseProducts = warehouseProductRepository.findAll(pageRequest);

        List<WarehouseProductDTO> wPDTOs = warehouseProducts.stream()
                .map(warehouseProductMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(wPDTOs, pageRequest, warehouseProducts.getTotalElements());
    }


    @Override
    public Page<WarehouseProductDTO> getWarehouseProductsWithFilters(
            Long warehouseId,
            Long managerId,
            Pageable pageable
    ) {
        Page<WarehouseProduct> warehouseProducts = warehouseProductRepository.findByFilters(
                managerId,
                warehouseId,
                pageable
        );
        return warehouseProducts.map(warehouseProductMapper::toDTO);
    }
}
