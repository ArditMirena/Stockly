package com.stockly.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class ExternalProductReviewDTO {
    private int rating;
    private String comment;
    private Instant date;
    private String reviewerName;
    private String reviewerEmail;
}

