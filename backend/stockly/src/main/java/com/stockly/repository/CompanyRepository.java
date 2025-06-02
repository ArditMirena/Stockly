package com.stockly.repository;

import com.stockly.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCompanyName(String companyName);
    List<Company> findByCompanyType(String companyType);
    List<Company> findAll(Specification<Company> specification);
    Page<Company> findByCompanyType(String companyType, Pageable pageable);
    Page<Company> findByManagerId(Long managerId, Pageable pageable);
    Page<Company> findByCompanyTypeAndManagerId(String companyType, Long managerId, Pageable pageable);
    List<Company> findByManagerId(Long managerId);

}