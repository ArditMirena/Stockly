package com.stockly.service.impl.query;

import com.stockly.model.Company;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.query.CompanyQueryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyQueryServiceImpl implements CompanyQueryService {

    private final CompanyRepository companyRepository;

    public CompanyQueryServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Override
    public Optional<Company> getCompanyById(Long id) {
        return companyRepository.findById(id);
    }

    @Override
    public Optional<Company> getCompanyByEmail(String email) {
        return companyRepository.findByEmail(email);
    }

    @Override
    public List<Company> getCompaniesByType(String companyType) {
        return companyRepository.findByCompanyType(companyType); // Implement the query method
    }
}