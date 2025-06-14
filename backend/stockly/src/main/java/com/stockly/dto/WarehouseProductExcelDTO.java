package com.stockly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseProductExcelDTO {
    private Long warehouseId;
    private String warehouseName;

    private String productTitle;
    private String productSku;
    private BigDecimal productPrice;

    private Integer quantity;
}
