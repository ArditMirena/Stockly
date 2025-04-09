package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProductReviewDTO {
    private Integer rating;
    private String comment;
    private Instant date;
    private String reviewerName;
    private String reviewerEmail;
}
