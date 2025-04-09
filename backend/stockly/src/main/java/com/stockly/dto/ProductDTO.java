package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class ProductDTO {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPercentage;
    private BigDecimal rating;
    private Integer stock;
    private String sku;
    private Double weight;
    private String warrantyInformation;
    private String shippingInformation;
    private String availabilityStatus;
    private String returnPolicy;
    private Integer minimumOrderQuantity;
    private String barcode;
    private String qrCode;
    private Instant createdAt;
    private Instant updatedAt;
    private String thumbnailUrl;
    private Long categoryId;
    private String categoryName;
    private DimensionDTO dimensions;
    private List<ProductReviewDTO> reviews;
    private Set<TagDTO> tags;
    private List<ProductImageDTO> images;
}
