package com.stockly.strategy;

import com.stockly.model.Company;

public class BuyerStrategy implements CompanyTypeStrategy {

    private final String businessType;

    public BuyerStrategy(String businessType) {
        this.businessType = businessType;
    }

    @Override
    public void applyAttributes(Company company) {
        company.setBusinessType(businessType); // Add businessType attribute in Company
    }
}