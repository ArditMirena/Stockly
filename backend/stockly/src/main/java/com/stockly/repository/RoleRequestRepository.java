package com.stockly.repository;

import com.stockly.model.RoleRequest;
import com.stockly.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long>, JpaSpecificationExecutor<RoleRequest> {
    Optional<RoleRequest> findByUser(User user);
}
