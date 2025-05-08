package com.stockly.service.command;

import com.stockly.dto.LoginUserDTO;
import com.stockly.dto.RegisterUserDTO;
import com.stockly.dto.VerifyUserDTO;
import com.stockly.model.User;
import com.stockly.responses.AuthResponse;

public interface AuthenticationService {
    public User signup(RegisterUserDTO input);
    public AuthResponse authenticate(LoginUserDTO input);
    public AuthResponse refreshAccessToken(String refreshToken);
    public void verifyUser(VerifyUserDTO input);
    public void resendVerificationCode(String email);
    public void sendVerificationEmail(User user);
}
