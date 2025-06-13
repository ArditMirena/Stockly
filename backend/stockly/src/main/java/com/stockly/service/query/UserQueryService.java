package com.stockly.service.query;

import com.stockly.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface UserQueryService {
    List<UserDTO> getAllUsers();
    Page<UserDTO> getAllUsersWithPagination(PageRequest pageRequest, String searchTerm);

    Long getUsersCount();
}
