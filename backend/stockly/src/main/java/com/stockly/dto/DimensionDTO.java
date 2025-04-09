package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DimensionDTO {
    private Double width;
    private Double height;
    private Double depth;
}
