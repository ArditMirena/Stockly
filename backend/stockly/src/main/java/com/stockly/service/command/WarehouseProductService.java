package com.stockly.service.command;

import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.WarehouseProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseProductService {

    @Autowired
    private WarehouseProductRepository warehouseProductRepository;



    public void updateProductAvailability(Long warehouseId, Long productId, String availability) {
        // Use the custom method to find the WarehouseProduct by warehouseId and productId
        Optional<WarehouseProduct> wpOpt = warehouseProductRepository.findByWarehouseIdAndProductId(warehouseId, productId);
        if (wpOpt.isPresent()) {
            WarehouseProduct wp = wpOpt.get();
            wp.setAvailability(availability);
            warehouseProductRepository.save(wp);
        } else {
            // Handle the case when no WarehouseProduct is found
            throw new RuntimeException("WarehouseProduct not found for warehouseId " + warehouseId + " and productId " + productId);
        }
    }
}
