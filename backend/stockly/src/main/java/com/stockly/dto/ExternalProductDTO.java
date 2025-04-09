package com.stockly.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExternalProductDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private double price;
    private double discountPercentage;
    private double rating;
    private int stock;
    private String sku;
    private double weight;
    private ExternalProductDimensionDTO dimensions;
    private String warrantyInformation;
    private String shippingInformation;
    private String availabilityStatus;
    private List<ExternalProductReviewDTO> reviews;
    private String returnPolicy;
    private int minimumOrderQuantity;
    private List<String> tags;
    private ExternalProductMetaDTO meta;
    private List<String> images;
    private String thumbnail;
}

