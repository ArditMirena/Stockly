package com.stockly.mapper;

import com.stockly.dto.AddressDTO;
import com.stockly.dto.CompanyDTO;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.model.Company;
import com.stockly.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class CompanyMapper {

    private final AddressMapper addressMapper;
    private final CityRepository cityRepository;

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