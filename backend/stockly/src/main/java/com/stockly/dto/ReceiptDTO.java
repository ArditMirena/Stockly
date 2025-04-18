package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class ReceiptDTO {
    private Long orderId;

    private Date orderDate;
    private Date deliveryDate;
    private String status;

    private CompanySummaryDTO buyer;
    private CompanySummaryDTO supplier;

    private BigDecimal totalPrice;

    private List<ReceiptItemDTO> items;
}
