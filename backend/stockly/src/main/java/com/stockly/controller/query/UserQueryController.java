package com.stockly.controller.query;

import com.stockly.dto.UserDTO;
import com.stockly.mapper.UserMapper;
import com.stockly.model.User;
import com.stockly.service.query.UserQueryService;
import io.micrometer.common.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserQueryController {
    private final UserQueryService userQueryService;
    private final UserMapper userMapper;

    public UserQueryController(UserQueryService userQueryService, UserMapper userMapper) {
        this.userQueryService = userQueryService;
        this.userMapper = userMapper;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userMapper.toDTO(currentUser));
    }

    @GetMapping()
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> userDTOs = userQueryService.getAllUsers();
        return ResponseEntity.ok(userDTOs);
    }


    @GetMapping("/page")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsersWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String searchTerm
    ) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userQueryService.getAllUsersWithPagination(pageRequest, searchTerm));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(userQueryService.getUsersCount());
    }
}
