package com.stockly.mapper;

import com.stockly.dto.CompanyDTO;
import com.stockly.model.Company;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class CompanyMapper {

    public CompanyDTO toDto(Company company) {
        if (company == null) {
            return null;
        }

        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setEmail(company.getEmail());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setAddress(company.getAddress());
        dto.setCompanyType(company.getCompanyType());

        // Relationships are typically not mapped in DTOs for command operations
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

        // Never update ID from DTO
        if (dto.getCompanyName() != null) {
            entity.setCompanyName(dto.getCompanyName());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getPhoneNumber() != null) {
            entity.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getAddress() != null) {
            entity.setAddress(dto.getAddress());
        }
        if (dto.getCompanyType() != null) {
            entity.setCompanyType(dto.getCompanyType());
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