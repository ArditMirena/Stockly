package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ReceiptItemDTO {
    private String productTitle;
    private String productSku;
    private String productThumbnail;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}