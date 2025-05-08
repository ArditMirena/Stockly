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
    private Long supplierId;
    private Long warehouseId;
    private Instant orderDate;
    private Date deliveryDate;
    private String status;
    private BigDecimal totalPrice;
    private Date updatedAt;
    private List<OrderItemDTO> items;
}
