package com.stockly.service.impl.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.exception.OperationNotAllowedException;
import com.stockly.mapper.CompanyMapper;
import com.stockly.model.Company;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.command.CompanyCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyCommandServiceImpl implements CompanyCommandService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    @Transactional
    public Company createCompany(CompanyDTO companyDTO) {
        if (companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new OperationNotAllowedException("Email already in use");
        }

        if (companyRepository.existsByCompanyName(companyDTO.getCompanyName())) {
            throw new OperationNotAllowedException("Company name already in use");
        }

        Company company = companyMapper.createNewCompanyFromDto(companyDTO);
        return companyRepository.save(company);
    }

    @Override
    @Transactional
    public Company updateCompany(Long id, CompanyDTO companyDTO) {
        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (!existingCompany.getEmail().equals(companyDTO.getEmail()) &&
                companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new OperationNotAllowedException("Email already in use by another company");
        }

        companyMapper.updateEntityFromDto(companyDTO, existingCompany);
        return companyRepository.save(existingCompany);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        // Check if company has any orders before deletion
        if (!company.getOrdersAsBuyer().isEmpty() || !company.getOrdersAsSupplier().isEmpty()) {
            throw new OperationNotAllowedException("Cannot delete company with existing orders");
        }

        companyRepository.delete(company);
    }
}