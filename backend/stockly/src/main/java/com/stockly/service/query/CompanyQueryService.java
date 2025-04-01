package com.stockly.service.query;

import com.stockly.model.Company;

import java.util.List;
import java.util.Optional;

public interface CompanyQueryService {
    List<Company> getAllCompanies();
    Optional<Company> getCompanyById(Long id);
    Optional<Company> getCompanyByEmail(String email);
    List<Company> getCompaniesByType(String companyType); // New method
}