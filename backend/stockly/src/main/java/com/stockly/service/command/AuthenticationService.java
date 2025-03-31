package com.stockly.service.command;

import com.stockly.dto.LoginUserDTO;
import com.stockly.dto.RegisterUserDTO;
import com.stockly.dto.VerifyUserDTO;
import com.stockly.model.User;

public interface AuthenticationService {
    public User signup(RegisterUserDTO input);
    public User authenticate(LoginUserDTO input);
    public void verifyUser(VerifyUserDTO input);
    public void resendVerificationCode(String email);
    public void sendVerificationEmail(User user);
}
