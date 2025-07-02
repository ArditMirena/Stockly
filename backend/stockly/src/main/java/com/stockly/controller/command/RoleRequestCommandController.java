package com.stockly.controller.command;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.service.command.RoleRequestCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/role-requests")
@RequiredArgsConstructor
public class RoleRequestCommandController {
    private final RoleRequestCommandService roleRequestCommandService;

    @PostMapping
    public ResponseEntity<RoleRequestDTO> createRoleRequest(
            @RequestBody RoleRequestDTO roleRequestDTO) {
        RoleRequestDTO createdRoleRequest = roleRequestCommandService.createRoleRequest(roleRequestDTO);
        return ResponseEntity.ok(createdRoleRequest);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoleRequest(
            @PathVariable Long id) {
        roleRequestCommandService.deleteRoleRequest(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveRoleRequest(
            @PathVariable Long id) {
        roleRequestCommandService.approveRoleRequest(id);
        return ResponseEntity.noContent().build();
    }
}
