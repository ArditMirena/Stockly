package com.stockly.service.impl.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.CompanyMapper;
import com.stockly.model.Company;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.specification.CompanySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyQueryServiceImpl implements CompanyQueryService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return companyMapper.toDto(company);
    }

    @Override
    public CompanyDTO getCompanyByEmail(String email) {
        Company company = companyRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with email: " + email));
        return companyMapper.toDto(company);
    }

    @Override
    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }


    @Override
    public List<CompanyDTO> getCompaniesByType(String companyType) {
        return companyRepository.findByCompanyType(companyType).stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean companyExistsByEmail(String email) {
        return companyRepository.existsByEmail(email);
    }

    @Override
    public boolean companyExistsByName(String companyName) {
        return companyRepository.existsByCompanyName(companyName);
    }

    @Override
    public List<CompanyDTO> searchCompanies(String searchTerm) {
        final Specification<Company> specification = CompanySpecification.unifiedSearch(searchTerm);
        final List<Company> companies = companyRepository.findAll(specification);
        return companies.stream().map(companyMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public Page<CompanyDTO> getAllCompaniesWithPagination(PageRequest pageRequest) {
        Page<Company> companies = companyRepository.findAll(pageRequest);

        List<CompanyDTO> companyDTOS = companies.stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(companyDTOS, pageRequest, companies.getTotalElements());
    }
}