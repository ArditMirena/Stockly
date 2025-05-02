package com.stockly.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Data
@Getter
@Setter
public class OrderItemDTO {
    private Long id;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    // Read-only fields
    private String productTitle;
    private String productSku;
    private String productThumbnail;
    private BigDecimal unitPrice;  // Read-only, populated from Product
    private BigDecimal totalPrice; // Read-only, calculated server-side
}