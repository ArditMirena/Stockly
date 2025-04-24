package com.stockly.mapper;

import com.stockly.dto.AddressDTO;
import com.stockly.dto.CompanyDTO;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.model.Company;
import com.stockly.model.User;
import com.stockly.repository.CityRepository;
import com.stockly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class CompanyMapper {

    private final AddressMapper addressMapper;
    private final CityRepository cityRepository;
    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public CompanyDTO toDto(Company company) {
        if (company == null) {
            return null;
        }

        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setEmail(company.getEmail());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setCompanyType(company.getCompanyType());
        dto.setManager(company.getManager().getId());
        dto.setCreatedAt(company.getCreatedAt());
        dto.setUpdatedAt(company.getUpdatedAt());


        if(company.getAddress() != null) {
            dto.setAddress(addressMapper.toDto(company.getAddress()));
        }


        return dto;
    }

    public Company toEntity(CompanyDTO dto) {
        if (dto == null) {
            return null;
        }

        Company company = new Company();
        updateEntityFromDto(dto, company);
        return company;
    }

    public void updateEntityFromDto(CompanyDTO dto, Company entity) {
        Objects.requireNonNull(dto, "CompanyDTO cannot be null");
        Objects.requireNonNull(entity, "Company cannot be null");


        if (dto.getCompanyName() != null) {
            entity.setCompanyName(dto.getCompanyName());
        }

        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }

        if (dto.getPhoneNumber() != null) {
            entity.setPhoneNumber(dto.getPhoneNumber());
        }

        if (dto.getCompanyType() != null) {
            entity.setCompanyType(dto.getCompanyType());
        }

        if (dto.getManager() != null) {
            User manager = userRepository.findById(dto.getManager())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found with ID: " + dto.getManager()));
            entity.setManager(manager);
        }

        if (dto.getCreatedAt() != null) {
            entity.setCreatedAt(dto.getCreatedAt());
        }

        if (dto.getUpdatedAt() != null) {
            entity.setUpdatedAt(dto.getUpdatedAt());
        }

        if (dto.getAddress() != null) {
            City city = cityRepository.findById(dto.getAddress().getCityId())
                    .orElseThrow(() -> new IllegalArgumentException("City not found"));

            Address address = addressMapper.toEntity(dto.getAddress(), city);
            entity.setAddress(address);
        }
    }

    public Company createNewCompanyFromDto(CompanyDTO dto) {
        Objects.requireNonNull(dto, "CompanyDTO cannot be null");

        Company company = toEntity(dto);
        company.setId(null); // Ensure new entity

        if (company.getCompanyType() == null) {
            company.setCompanyType("GENERAL");
        }

        return company;
    }
}