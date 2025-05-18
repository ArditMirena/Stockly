package com.stockly.service.query;

import com.stockly.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface UserQueryService {
    public List<UserDTO> getAllUsers();
    public Page<UserDTO> getAllUsersWithPagination(PageRequest pageRequest);
    public List<UserDTO> searchUsers(String searchTerm);

    Long getUsersCount();
}
