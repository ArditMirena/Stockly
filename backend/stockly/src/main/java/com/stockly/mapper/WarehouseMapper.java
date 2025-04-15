package com.stockly.mapper;

import com.stockly.dto.WarehouseDTO;
import com.stockly.model.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class WarehouseMapper {

    public WarehouseDTO toDto(Warehouse warehouse) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setAddress(warehouse.getAddress());
        dto.setManagerId(warehouse.getManagerId());
        dto.setAvailabilityStatus(warehouse.getAvailabilityStatus());
        return dto;
    }

    public Warehouse toEntity(WarehouseDTO dto) {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(dto.getId());
        warehouse.setName(dto.getName());
        warehouse.setAddress(dto.getAddress());
        warehouse.setManagerId(dto.getManagerId());
        warehouse.setAvailabilityStatus(dto.getAvailabilityStatus());
        return warehouse;
    }
}
