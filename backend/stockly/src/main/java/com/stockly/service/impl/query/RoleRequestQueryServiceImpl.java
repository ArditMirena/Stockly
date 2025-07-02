package com.stockly.service.impl.query;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.mapper.RoleRequestMapper;
import com.stockly.model.RoleRequest;
import com.stockly.repository.RoleRequestRepository;
import com.stockly.service.query.RoleRequestQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleRequestQueryServiceImpl implements RoleRequestQueryService {
    private final RoleRequestRepository roleRequestRepository;
    private final RoleRequestMapper roleRequestMapper;

    @Override
    public Page<RoleRequestDTO> getAllRoleRequestsWithPagination(PageRequest pageRequest) {
        Page<RoleRequest> roleRequests = roleRequestRepository.findAll(pageRequest);

        List<RoleRequestDTO> roleRequestsList = roleRequests.stream()
                .map(roleRequestMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(roleRequestsList, pageRequest, roleRequests.getTotalElements());
    }

}
