package com.stockly.mapper;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WarehouseProductMapper {

    public WarehouseProductDTO toDTO(WarehouseProduct warehouseProduct) {
        if (warehouseProduct == null) return null;

        return WarehouseProductDTO.builder()
                .id(warehouseProduct.getId())
                .warehouseId(warehouseProduct.getWarehouse().getId())
                .warehouseName(warehouseProduct.getWarehouse().getName())
                .productId(warehouseProduct.getProduct().getId())
                .productTitle(warehouseProduct.getProduct().getTitle())
                .createdAt(warehouseProduct.getCreatedAt())
                .updatedAt(warehouseProduct.getUpdatedAt())
                .quantity(warehouseProduct.getQuantity())
                .unitPrice(warehouseProduct.getProduct().getPrice())
                .build();
    }

    public static WarehouseProduct toEntity(WarehouseProductDTO dto) {
        if (dto == null) return null;

        WarehouseProduct warehouseProduct = new WarehouseProduct();
        warehouseProduct.setId(dto.getId());
        warehouseProduct.setQuantity(dto.getQuantity());

        // Map only IDs for associated entities
        Warehouse warehouse = new Warehouse();
        warehouse.setId(dto.getWarehouseId());
        warehouseProduct.setWarehouse(warehouse);

        Product product = new Product();
        product.setId(dto.getProductId());
        warehouseProduct.setProduct(product);

        return warehouseProduct;
    }
}
