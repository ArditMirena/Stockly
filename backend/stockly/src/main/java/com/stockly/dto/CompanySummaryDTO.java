package com.stockly.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanySummaryDTO {
    private Long id;
    private String companyName;
    private String email;
    private String phoneNumber;
    private String address;
    private String companyType;
}

