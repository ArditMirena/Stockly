package com.stockly.service.impl.command;

import com.stockly.factory.CompanyTypeStrategyFactory;
import com.stockly.model.Company;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.command.CompanyCommandService;
import com.stockly.strategy.CompanyTypeStrategy;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class CompanyCommandServiceImpl implements CompanyCommandService {

    private final CompanyRepository companyRepository;

    public CompanyCommandServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public Company createCompany(Company company, String businessType, Long warehouseId) {
        // Dynamically apply the correct strategy based on companyType
        CompanyTypeStrategy strategy = CompanyTypeStrategyFactory.getStrategy(
                company.getCompanyType(),
                businessType,
                warehouseId
        );
        strategy.applyAttributes(company);
        return companyRepository.save(company);
    }

    @Override
    public Company updateCompany(Long id, Company company) {
        return companyRepository.findById(id).map(existingCompany -> {
            existingCompany.setCompanyName(company.getCompanyName());
            existingCompany.setManager(company.getManager());
            existingCompany.setEmail(company.getEmail());
            existingCompany.setPhoneNumber(company.getPhoneNumber());
            existingCompany.setAddress(company.getAddress());
            existingCompany.setCompanyType(company.getCompanyType());
            return companyRepository.save(existingCompany);
        }).orElseThrow(() -> new RuntimeException("Company not found with id " + id));
    }

    @Override
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }
}