package com.stockly.dto;

import com.stockly.model.RoleEnum;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleRequestDTO {
    private Long id;
    private Long userId;
    private String role;
    private boolean approved;
}
