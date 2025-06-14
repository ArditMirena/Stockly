package com.stockly.boostrap;

import com.stockly.dto.RegisterUserDTO;
import com.stockly.model.Role;
import com.stockly.model.RoleEnum;
import com.stockly.model.User;
import com.stockly.repository.RoleRepository;
import com.stockly.repository.UserRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Component
public class AdminSeeder implements ApplicationListener<ContextRefreshedEvent> {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        this.seedUsersPerRole();
    }

    public void seedUsersPerRole() {
        for (RoleEnum roleEnum : RoleEnum.values()) {
            String email = roleEnum.name().toLowerCase() + "@email.com";
            String username = roleEnum.name().toLowerCase();

            Optional<User> existingUser = userRepository.findByEmail(email);
            Optional<Role> roleOpt = roleRepository.findByName(roleEnum);

            if (existingUser.isEmpty() && roleOpt.isPresent()) {
                User user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("123qwe"));
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
                user.setEnabled(true);
                user.setRole(roleOpt.get());

                userRepository.save(user);
                System.out.println("Seeded user for role: " + roleEnum.name());
            }
        }
    }
}
