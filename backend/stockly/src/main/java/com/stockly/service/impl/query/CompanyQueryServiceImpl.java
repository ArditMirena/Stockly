package com.stockly.service.impl.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.CompanyMapper;
import com.stockly.model.Company;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.specification.CompanySpecification;
import io.micrometer.common.util.StringUtils;
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
    public Page<CompanyDTO> getAllCompaniesWithPagination(PageRequest pageRequest,
                                                          String companyType, Long managerId, String searchTerm) {
        Specification<Company> spec = Specification.where(null);

        if (StringUtils.isNotEmpty(searchTerm)) {
            spec = spec.and(CompanySpecification.unifiedSearch(searchTerm));
        }

        if (StringUtils.isNotEmpty(companyType)) {
            spec = spec.and(CompanySpecification.hasCompanyType(companyType));
        }

        if (managerId != null) {
            spec = spec.and(CompanySpecification.hasManagerId(managerId));
        }

        Page<Company> companies = companyRepository.findAll(spec, pageRequest);

        return companies.map(companyMapper::toDto);
    }


    @Override
    public Page<CompanyDTO> getCompaniesWithFilters(String companyType, Long managerId, Pageable pageable) {
        if (companyType != null && managerId != null) {
            return companyRepository.findByCompanyTypeAndManagerId(companyType, managerId, pageable)
                    .map(companyMapper::toDto);
        } else if (companyType != null) {
            return companyRepository.findByCompanyType(companyType, pageable)
                    .map(companyMapper::toDto);
        } else if (managerId != null) {
            return companyRepository.findByManagerId(managerId, pageable)
                    .map(companyMapper::toDto);
        } else {
            return companyRepository.findAll(pageable)
                    .map(companyMapper::toDto);
        }
    }

    @Override
    public List<CompanyDTO> getCompaniesByManager(Long managerId) {
        return companyRepository.findByManagerId(managerId).stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Long getCompanyCount(){
        return companyRepository.count();
    }

    @Override
    public List<CompanyDTO> getCompaniesWithWarehouses() {
        return companyRepository.findByWarehousesIsNotEmpty().stream()
                .map(companyMapper::toDto)
                .collect(Collectors.toList());
    }
}