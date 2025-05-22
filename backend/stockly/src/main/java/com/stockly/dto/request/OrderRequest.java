package com.stockly.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
public class OrderRequest {
    @NotNull
    private Long sourceWarehouseId;

    @NotNull
    private Long buyerId;

    private Long destinationWarehouseId;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;
}
