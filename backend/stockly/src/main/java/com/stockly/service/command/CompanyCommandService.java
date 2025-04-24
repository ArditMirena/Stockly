package com.stockly.service.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.model.Company;
import com.stockly.model.User;

public interface CompanyCommandService {
    CompanyDTO createCompany(CompanyDTO companyDTO);
    Company updateCompany(Long id, CompanyDTO companyDTO);
    void deleteCompany(Long id);
    void assignCompanyToUser(User user, Company company);
}