package com.stockly.dto;

import com.stockly.model.RoleEnum;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
}
