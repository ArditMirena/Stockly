package com.stockly.strategy;

import com.stockly.model.Company;

public class ManufacturerStrategy implements CompanyTypeStrategy {

    @Override
    public void apply(Company company) {
        company.setCompanyType("MANUFACTURER");
    }
}
