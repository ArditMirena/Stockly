package com.stockly.service.impl.query;

import com.stockly.dto.WarehouseDTO;
import com.stockly.mapper.WarehouseMapper;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.query.WarehouseQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WarehouseQueryServiceImpl implements WarehouseQueryService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

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
}
