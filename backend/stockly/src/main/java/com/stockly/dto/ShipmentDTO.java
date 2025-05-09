package com.stockly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ShipmentDTO {
    private String id;
    private String trackingCode;
    private String status;
    private String labelUrl;
    private Float rate;
    private String carrier;
    private String service;
}
