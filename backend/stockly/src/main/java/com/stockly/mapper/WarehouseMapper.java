package com.stockly.mapper;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class WarehouseMapper {

    private final AddressMapper addressMapper;
    private final CompanyRepository companyRepository;
    private final CityRepository cityRepository;
    private final WarehouseProductMapper warehouseProductMapper;

    public WarehouseDTO toDto(Warehouse warehouse) {
        if (warehouse == null) {
            return null;
        }

        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setCompanyId(warehouse.getCompany().getId());
        dto.setIsActive(warehouse.getIsActive());

        if(warehouse.getWarehouseProducts() != null &&
                !warehouse.getWarehouseProducts().isEmpty()) {
            List<WarehouseProductDTO> warehouseProducts = warehouse.getWarehouseProducts().stream()
                    .map(warehouseProductMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setProducts(warehouseProducts);
        }

        if (warehouse.getAddress() != null) {
            dto.setAddress(addressMapper.toDto(warehouse.getAddress()));
        }
        return dto;
    }

    public Warehouse toEntity(WarehouseDTO dto) {

        City city = cityRepository.findById(dto.getAddress().getCityId())
                .orElseThrow(() -> new IllegalArgumentException("City not found"));

        Address address = addressMapper.toEntity(dto.getAddress(), city);

        Warehouse warehouse = new Warehouse();
        warehouse.setId(dto.getId());
        warehouse.setName(dto.getName());
        warehouse.setAddress(address);
        warehouse.setCompany(
                companyRepository.findById(dto.getCompanyId())
                        .orElseThrow(() -> new IllegalArgumentException("Company not found for ID: " + dto.getCompanyId()))
        );

        return warehouse;
    }
}
