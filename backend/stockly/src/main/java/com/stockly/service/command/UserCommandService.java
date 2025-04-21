package com.stockly.service.command;

import com.stockly.dto.RegisterUserDTO;
import com.stockly.dto.UserDTO;
import com.stockly.model.User;

public interface UserCommandService {
    public User createAdministrator(RegisterUserDTO input);
    public UserDTO updateUser(Long id, UserDTO userDTO);
    public void deleteUser(Long id);
    public void sendVerificationEmail(User user);
}
