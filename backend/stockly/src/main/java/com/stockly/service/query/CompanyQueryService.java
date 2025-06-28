package com.stockly.service.query;

import com.stockly.dto.CompanyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyQueryService {
    CompanyDTO getCompanyById(Long id);
    CompanyDTO getCompanyByEmail(String email);
    List<CompanyDTO> getAllCompanies();
    List<CompanyDTO> getCompaniesByType(String companyType);
    boolean companyExistsByEmail(String email);
    boolean companyExistsByName(String companyName);
    List<CompanyDTO> searchCompanies(String searchTerm);
    Page<CompanyDTO> getAllCompaniesWithPagination(PageRequest pageRequest, String companyType, Long managerId, String searchTerm);
    Long getCompanyCount();
    List<CompanyDTO> getCompaniesByManager(Long managerId);
    Page<CompanyDTO> getCompaniesWithFilters(String companyType, Long managerId, Pageable pageable);
    List<CompanyDTO> getCompaniesWithWarehouses();
}