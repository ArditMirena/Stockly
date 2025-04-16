package com.stockly.dto;

public class WarehouseProductDTO {

    private Long dtoWarehouseId;  // The ID of the warehouse (specific for DTO)
    private Long dtoProductId;    // The ID of the product (specific for DTO)
    private String dtoAvailability;  // The availability status (specific for DTO)

    // Getters and Setters
    public Long getDtoWarehouseId() {
        return dtoWarehouseId;
    }

    public void setDtoWarehouseId(Long dtoWarehouseId) {
        this.dtoWarehouseId = dtoWarehouseId;
    }

    public Long getDtoProductId() {
        return dtoProductId;
    }

    public void setDtoProductId(Long dtoProductId) {
        this.dtoProductId = dtoProductId;
    }

    public String getDtoAvailability() {
        return dtoAvailability;
    }

    public void setDtoAvailability(String dtoAvailability) {
        this.dtoAvailability = dtoAvailability;
    }
}
