package com.stockly.controller.query;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.dto.UserDTO;
import com.stockly.service.query.RoleRequestQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/role-requests")
@RequiredArgsConstructor
public class RoleRequestQueryController {
    private final RoleRequestQueryService roleRequestQueryService;

    @GetMapping("/page")
    public ResponseEntity<Page<RoleRequestDTO>> getAllUsersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortBy));
        Page<RoleRequestDTO> requests = roleRequestQueryService.getAllRoleRequestsWithPagination(pageRequest);
        return ResponseEntity.ok(requests);
    }
}