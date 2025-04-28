package com.stockly.service.impl.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.exception.OperationNotAllowedException;
import com.stockly.mapper.AddressMapper;
import com.stockly.mapper.CompanyMapper;
import com.stockly.mapper.UserMapper;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.model.Company;
import com.stockly.model.User;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.UserRepository;
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
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        validateCompanyCreation(companyDTO);

        City city = cityRepository.findById(companyDTO.getAddress().getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: " + companyDTO.getAddress().getCityId()));

        Address address = addressMapper.toEntity(companyDTO.getAddress(), city);
        User manager = userRepository.findById(companyDTO.getManager())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + companyDTO.getManager()));

        Company company = companyMapper.createNewCompanyFromDto(companyDTO);
        company.setAddress(address);

        // Ensure company type is set before assigning to user
        if (companyDTO.getWarehouses() != null && !companyDTO.getWarehouses().isEmpty()) {
            company.setCompanyType("SUPPLIER");
        } else if (companyDTO.getBusinessType() != null && !companyDTO.getBusinessType().isEmpty()) {
            company.setCompanyType("BUYER");
        }

        // Save first to ensure ID is generated
        company = companyRepository.saveAndFlush(company);
        assignCompanyToUser(manager, company);

        return companyMapper.toDto(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyDTO updateCompany(Long id, CompanyDTO companyDTO) {
        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        validateCompanyUpdate(existingCompany, companyDTO);

        companyMapper.updateEntityFromDto(companyDTO, existingCompany);

        // Explicitly update company type based on current state
        existingCompany.determineCompanyType();

        Company updatedCompany = companyRepository.saveAndFlush(existingCompany);
        return companyMapper.toDto(updatedCompany);
    }

    @Override
    @Transactional
    public void assignCompanyToUser(User user, Company company) {
        if (!user.getRole().equals(company.getCompanyType())) {
            throw new IllegalStateException("User can only manage companies of type: " + user.getRole());
        }

        company.setManager(user);
        companyRepository.saveAndFlush(company);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (!company.getOrdersAsBuyer().isEmpty() || !company.getOrdersAsSupplier().isEmpty()) {
            throw new OperationNotAllowedException("Cannot delete company with existing orders");
        }

        companyRepository.delete(company);
    }

    private void validateCompanyCreation(CompanyDTO companyDTO) {
        if (companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new OperationNotAllowedException("Email already in use");
        }

        if (companyRepository.existsByCompanyName(companyDTO.getCompanyName())) {
            throw new OperationNotAllowedException("Company name already in use");
        }

        if (companyDTO.getAddress().getCityId() == null) {
            throw new IllegalArgumentException("City ID must not be null");
        }
    }

    private void validateCompanyUpdate(Company existingCompany, CompanyDTO companyDTO) {
        if (!existingCompany.getEmail().equals(companyDTO.getEmail()) &&
                companyRepository.existsByEmail(companyDTO.getEmail())) {
            throw new OperationNotAllowedException("Email already in use by another company");
        }
    }
}