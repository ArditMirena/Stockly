package com.stockly.repository;

import com.stockly.model.RoleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RoleRequestRepository extends JpaRepository<RoleRequest, Long>, JpaSpecificationExecutor<RoleRequest> {
}
