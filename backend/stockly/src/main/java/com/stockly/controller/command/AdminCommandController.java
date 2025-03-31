package com.stockly.controller.command;

import com.stockly.dto.RegisterUserDTO;
import com.stockly.model.User;
import com.stockly.service.command.UserCommandService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admins")
public class AdminCommandController {
    private final UserCommandService userCommandService;

    public AdminCommandController(UserCommandService userCommandService) {
        this.userCommandService = userCommandService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<User> createAdministrator(@RequestBody RegisterUserDTO registerUserDto) {
        User createdAdmin = userCommandService.createAdministrator(registerUserDto);

        return ResponseEntity.ok(createdAdmin);
    }
}
