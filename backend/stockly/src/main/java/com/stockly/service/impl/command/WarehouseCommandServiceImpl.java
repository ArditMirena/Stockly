package com.stockly.service.impl.command;

import com.stockly.dto.WarehouseDTO;
import com.stockly.mapper.WarehouseMapper;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.WarehouseCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseCommandServiceImpl implements WarehouseCommandService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    @Override
    public WarehouseDTO createWarehouse(WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseMapper.toEntity(warehouseDTO);
        Warehouse saved = warehouseRepository.save(warehouse);
        return warehouseMapper.toDto(saved);
    }

    @Override
    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        Warehouse updated = warehouseMapper.toEntity(warehouseDTO);
        updated.setId(existing.getId()); // Keep existing ID
        Warehouse saved = warehouseRepository.save(updated);

        return warehouseMapper.toDto(saved);
    }

    @Override
    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new RuntimeException("Warehouse not found with id: " + id);
        }
        warehouseRepository.deleteById(id);
    }

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

    public void assignProductToWarehouse(Long warehouseId, Long productId, String dtoAvailability) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WarehouseProduct wp = new WarehouseProduct();
        wp.setWarehouse(warehouse);
        wp.setProduct(product);
        wp.setAvailability("available"); // or set this based on some logic or parameter

        warehouseProductRepository.save(wp);
    }













}
