package com.stockly.service.query;

import com.stockly.dto.RoleRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface RoleRequestQueryService {
    Page<RoleRequestDTO> getAllRoleRequestsWithPagination(PageRequest pageRequest);
}
