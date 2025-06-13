package com.stockly.service.impl.query;

import com.stockly.dto.UserDTO;
import com.stockly.mapper.UserMapper;
import com.stockly.model.User;
import com.stockly.repository.UserRepository;
import com.stockly.service.query.UserQueryService;
import com.stockly.specification.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserQueryServiceImpl implements UserQueryService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserQueryServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        return users.stream().map(userMapper::toDTO).collect(Collectors.toList());
    }

    public Page<UserDTO> getAllUsersWithPagination(PageRequest pageRequest, String searchTerm) {
        Specification<User> spec = UserSpecification.unifiedSearch(searchTerm);
        Page<User> users = userRepository.findAll(spec, pageRequest);

        List<UserDTO> userDTOs = users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageRequest, users.getTotalElements());
    }

    @Override
    public Long getUsersCount() {
        return userRepository.count();
    }
}
