package com.stockly.service.impl.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.exception.OperationNotAllowedException;
import com.stockly.mapper.AddressMapper;
import com.stockly.mapper.CompanyMapper;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.model.Company;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CompanyRepository;
import com.stockly.service.command.CompanyCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyCommandServiceImpl implements CompanyCommandService {

    private final CityRepository cityRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final AddressMapper addressMapper;

    @Override
    @Transactional
    public Company createCompany(CompanyDTO companyDTO) {
        if (companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new OperationNotAllowedException("Email already in use");
        }

        if (companyRepository.existsByCompanyName(companyDTO.getCompanyName())) {
            throw new OperationNotAllowedException("Company name already in use");
        }

        Long cityId = companyDTO.getAddress().getCityId();
        if (cityId == null) {
            throw new IllegalArgumentException("City ID must not be null");
        }


        City city = cityRepository.findById(companyDTO.getAddress().getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: "+companyDTO.getAddress().getCityId()));

        Address address = addressMapper.toEntity(companyDTO.getAddress(), city);

        Company company = companyMapper.createNewCompanyFromDto(companyDTO);
        company.setAddress(address);

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