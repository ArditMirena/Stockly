package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class ReceiptDTO {
    private Long orderId;

    private Instant orderDate;
    private Date deliveryDate;
    private String status;

    private CompanySummaryDTO buyer;
    private CompanySummaryDTO supplier;

    private WarehouseSummaryDTO destinationWarehouse;
    private WarehouseSummaryDTO sourceWarehouse;

    private BigDecimal totalPrice;

    private List<ReceiptItemDTO> items;
}
