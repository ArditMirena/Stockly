package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WarehouseSummaryDTO {
    private Long id;
    private String name;
    private String address;
}
