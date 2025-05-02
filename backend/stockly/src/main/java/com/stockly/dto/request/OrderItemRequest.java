package com.stockly.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class OrderItemRequest {
    @NotNull
    private Long productId;

    @Positive
    private Integer quantity;
}