package com.stockly.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ExternalProductMetaDTO {
    private Instant createdAt;
    private Instant updatedAt;
    private String barcode;
    private String qrCode;
}
