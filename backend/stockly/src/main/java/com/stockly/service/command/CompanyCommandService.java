package com.stockly.service.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.model.Company;

public interface CompanyCommandService {
    Company createCompany(CompanyDTO companyDTO);
    Company updateCompany(Long id, CompanyDTO companyDTO);
    void deleteCompany(Long id);
}