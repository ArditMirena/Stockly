package com.stockly.mapper;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.model.RoleRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleRequestMapper {
    public RoleRequestDTO toDTO(RoleRequest roleRequest) {
        if (roleRequest == null) return null;

        return RoleRequestDTO.builder()
                .id(roleRequest.getId())
                .userId(roleRequest.getUser().getId())
                .role(roleRequest.getRole().getName().name())
                .approved(roleRequest.isApproved())
                .build();
    }
}
