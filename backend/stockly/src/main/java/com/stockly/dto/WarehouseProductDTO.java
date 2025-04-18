package com.stockly.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Data
@Builder
@Getter
@Setter
public class WarehouseProductDTO {

    private Long id;

    private Long warehouseId;

    private String warehouseName;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String availability;


    private String productTitle;
    private String productSku;
    private String productThumbnail;
    private BigDecimal unitPrice;
}
