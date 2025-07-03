package com.stockly.service.impl.command;

import com.stockly.dto.RoleRequestDTO;
import com.stockly.model.Role;
import com.stockly.model.RoleEnum;
import com.stockly.model.RoleRequest;
import com.stockly.model.User;
import com.stockly.repository.RoleRepository;
import com.stockly.repository.RoleRequestRepository;
import com.stockly.repository.UserRepository;
import com.stockly.service.command.RoleRequestCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleRequestCommandServiceImpl implements RoleRequestCommandService {
    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public RoleRequestDTO createRoleRequest(RoleRequestDTO roleRequestDTO) {
        // Find user
        User user = userRepository.findById(roleRequestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find role
        RoleEnum roleEnum = RoleEnum.valueOf(roleRequestDTO.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Check if user already has a role request
        RoleRequest roleRequest = roleRequestRepository.findByUser(user)
                .orElse(new RoleRequest()); // If not found, create new

        // Update the existing or new role request
        roleRequest.setUser(user);
        roleRequest.setRole(role);

        // Save the role request (will update if exists, create if new)
        roleRequestRepository.save(roleRequest);

        return roleRequestDTO;
    }

    @Override
    public void deleteRoleRequest(Long id) {
        RoleRequest roleRequest = roleRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role request not found"));
        roleRequestRepository.delete(roleRequest);
    }

    @Override
    public void approveRoleRequest(Long id) {
        RoleRequest roleRequest = roleRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role request not found"));
        if (roleRequest != null) {
            roleRequest.setApproved(true);
            User user = roleRequest.getUser();
            user.setRole(roleRequest.getRole());
            userRepository.save(user);
            roleRequestRepository.save(roleRequest);
        }
    }
}
