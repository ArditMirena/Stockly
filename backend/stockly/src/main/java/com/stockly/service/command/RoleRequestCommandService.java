package com.stockly.service.command;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.model.RoleRequest;

public interface RoleRequestCommandService {
    RoleRequestDTO createRoleRequest(RoleRequestDTO roleRequest);
    void deleteRoleRequest(Long id);
    void approveRoleRequest(Long id);
}
