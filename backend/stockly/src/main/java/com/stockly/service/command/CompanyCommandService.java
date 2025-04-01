package com.stockly.service.command;

import com.stockly.model.Company;

public interface CompanyCommandService {
    Company createCompany(Company company, String businessType, Long warehouseId); // Updated
    Company updateCompany(Long id, Company company);
    void deleteCompany(Long id);
}