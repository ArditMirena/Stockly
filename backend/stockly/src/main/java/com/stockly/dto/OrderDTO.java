package com.stockly.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class OrderDTO {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private Long supplierId;
    private String supplierName;
    private Long sourceWarehouseId;
    private Long destinationWarehouseId;
    private Instant orderDate;
    private Date deliveryDate;
    private String status;
    private BigDecimal totalPrice;
    private String shipmentId;
    private Date updatedAt;
    private List<OrderItemDTO> items;
}
