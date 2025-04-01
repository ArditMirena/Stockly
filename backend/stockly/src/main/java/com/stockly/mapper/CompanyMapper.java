package com.stockly.mapper;

import com.stockly.dto.CompanyDTO;
import com.stockly.model.Company;

public class CompanyMapper {

    public static CompanyDTO toDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setEmail(company.getEmail());
        dto.setPhoneNumber(company.getPhoneNumber());
        dto.setAddress(company.getAddress());
        dto.setCompanyType(company.getCompanyType());
        return dto;
    }

    public static Company toEntity(CompanyDTO dto) {
        Company company = new Company();
        company.setId(dto.getId());
        company.setCompanyName(dto.getCompanyName());
        company.setEmail(dto.getEmail());
        company.setPhoneNumber(dto.getPhoneNumber());
        company.setAddress(dto.getAddress());
        company.setCompanyType(dto.getCompanyType());
        return company;
    }
}