package com.stockly.mapper;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.model.Product;
import com.stockly.model.PredictionResult;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.service.query.PredictionQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WarehouseProductMapper {

    private final PredictionQueryService predictionQueryService;

    public WarehouseProductDTO toDTO(WarehouseProduct warehouseProduct) {
        if (warehouseProduct == null) return null;

        // Get prediction data for this product in this warehouse
        PredictionResult prediction = predictionQueryService.getPredictionsByProductId(
                predictionQueryService.getCurrentMonth(),
                warehouseProduct.getProduct().getId()
        );

        WarehouseProductDTO.WarehouseProductDTOBuilder builder = WarehouseProductDTO.builder()
                .id(warehouseProduct.getId())
                .warehouseId(warehouseProduct.getWarehouse().getId())
                .warehouseName(warehouseProduct.getWarehouse().getName())
                .productId(warehouseProduct.getProduct().getId())
                .productTitle(warehouseProduct.getProduct().getTitle())
                .productSku(warehouseProduct.getProduct().getSku())
                .createdAt(warehouseProduct.getCreatedAt())
                .updatedAt(warehouseProduct.getUpdatedAt())
                .quantity(warehouseProduct.getQuantity())
                .availability(warehouseProduct.getAvailability())
                .unitPrice(warehouseProduct.getProduct().getPrice())
                .automatedRestock(warehouseProduct.isAutomatedRestock());

        // Add prediction fields if prediction exists
        if (prediction != null && prediction.getStockData() != null && prediction.getDemandForecast() != null && prediction.getRecommendation() != null) {
            builder.daysRemaining(prediction.getStockData().getDaysRemaining())
                    .weeklyPredictedDemand(prediction.getDemandForecast().getWeeklyPredicted7d())
                    .suggestedRestock(prediction.getRecommendation().getSuggestedRestock());
        }

        return builder.build();
    }

    public static WarehouseProduct toEntity(WarehouseProductDTO dto) {
        if (dto == null) return null;

        WarehouseProduct warehouseProduct = new WarehouseProduct();
        warehouseProduct.setId(dto.getId());
        warehouseProduct.setQuantity(dto.getQuantity());
        warehouseProduct.setAvailability(dto.getAvailability());
        warehouseProduct.setAutomatedRestock(dto.isAutomatedRestock());

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