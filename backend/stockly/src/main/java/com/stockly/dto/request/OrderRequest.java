package com.stockly.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class OrderRequest {
    @NotNull
    private Long warehouseId;

    @NotNull
    private Long buyerId;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;
}
