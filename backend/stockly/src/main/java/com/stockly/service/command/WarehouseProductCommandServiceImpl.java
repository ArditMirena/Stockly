package com.stockly.service.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WarehouseProductCommandServiceImpl implements WarehouseProductCommandService {

    private final WarehouseProductRepository warehouseProductRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    @Autowired
    public WarehouseProductCommandServiceImpl(WarehouseProductRepository warehouseProductRepository,
                                          WarehouseRepository warehouseRepository,
                                          ProductRepository productRepository) {
        this.warehouseProductRepository = warehouseProductRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    public void assignProductToWarehouse(WarehouseProductDTO warehouseProductDTO) {
        // Fetch Warehouse and Product based on DTO data
        Warehouse warehouse = warehouseRepository.findById(warehouseProductDTO.getDtoWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Product product = productRepository.findById(warehouseProductDTO.getDtoProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create a new WarehouseProduct entity and set the values
        WarehouseProduct warehouseProduct = new WarehouseProduct();
        warehouseProduct.setWarehouse(warehouse);
        warehouseProduct.setProduct(product);
        warehouseProduct.setAvailability(warehouseProductDTO.getDtoAvailability());

        // Save the new WarehouseProduct entity to the repository
        warehouseProductRepository.save(warehouseProduct);
    }
}
