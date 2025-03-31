package com.stockly.service.command;

import com.stockly.dto.RegisterUserDTO;
import com.stockly.model.User;

public interface UserCommandService {
    public User createAdministrator(RegisterUserDTO input);
    public void sendVerificationEmail(User user);
}
