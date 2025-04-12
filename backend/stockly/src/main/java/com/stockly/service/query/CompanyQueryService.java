package com.stockly.service.query;

import com.stockly.dto.CompanyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyQueryService {
    CompanyDTO getCompanyById(Long id);
    CompanyDTO getCompanyByEmail(String email);
    List<CompanyDTO> getAllCompanies();
    Page<CompanyDTO> getAllCompanies(Pageable pageable);
    List<CompanyDTO> getCompaniesByType(String companyType);
    boolean companyExistsByEmail(String email);
    boolean companyExistsByName(String companyName);
}