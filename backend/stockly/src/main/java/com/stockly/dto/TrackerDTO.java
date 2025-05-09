package com.stockly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackerDTO {
    private String trackingCode;
    private String status;
    private String carrier;
    private String publicUrl;
}
