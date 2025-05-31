package com.stockly.service.impl.query;

import com.stockly.dto.ProductDTO;
import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.mapper.ProductMapper;
import com.stockly.mapper.WarehouseMapper;
import com.stockly.mapper.WarehouseProductMapper;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.query.WarehouseQueryService;
import com.stockly.specification.WarehouseSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseQueryServiceImpl implements WarehouseQueryService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final WarehouseProductRepository warehouseProductRepository;
    private final WarehouseProductMapper warehouseProductMapper;

    @Override
    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll()
                .stream()
                .map(warehouseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<WarehouseDTO> getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .map(warehouseMapper::toDto);
    }

    @Override
    public List<WarehouseDTO> getWarehousesByCompanyId(Long companyId) {
        return warehouseRepository.findByCompanyId(companyId).stream()
                .map(warehouseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean warehouseExistsByName(String name) {
        return warehouseRepository.existsByName(name);
    }

    @Override
    public List<WarehouseDTO> searchWarehouses(String searchTerm, Long companyId) {
        Specification<Warehouse> spec = Specification.where(WarehouseSpecification.unifiedSearch(searchTerm))
                .and(WarehouseSpecification.byCompanyId(companyId));

        return warehouseRepository.findAll(spec).stream()
                .map(warehouseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<WarehouseDTO> getAllWarehousesWithPagination(Pageable pageable) {
        Page<Warehouse> warehouses = warehouseRepository.findAll(pageable);

        List<WarehouseDTO> warehouseDTOs = warehouses.stream()
                .map(warehouseMapper::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(warehouseDTOs, pageable, warehouses.getTotalElements());
    }

    @Override
    public Page<WarehouseDTO> getWarehousesByCompanyWithPagination(Long companyId, Pageable pageable) {
        Specification<Warehouse> spec = WarehouseSpecification.byCompanyId(companyId);
        Page<Warehouse> warehouses = warehouseRepository.findAll(spec, pageable);

        return warehouses.map(warehouseMapper::toDto);
    }

    @Override
    public List<WarehouseProductDTO> getProductsByWarehouseId(Long warehouseId) {
        // Get all warehouse products for the given warehouse ID
        List<WarehouseProduct> warehouseProducts = warehouseProductRepository.findByWarehouseId(warehouseId);

        // Map each warehouse product's product to ProductDTO using your existing mapper
        return warehouseProducts.stream()
                .map(warehouseProductMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Long getWarehousesCount(){
        return warehouseRepository.count();
    }

}
