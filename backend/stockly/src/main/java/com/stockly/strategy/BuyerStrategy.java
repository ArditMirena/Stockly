package com.stockly.strategy;

import com.stockly.model.Company;

public class BuyerStrategy implements CompanyTypeStrategy {
    @Override
    public void apply(Company company) {
        // Additional buyer-specific logic can go here
        company.setCompanyType("BUYER");
    }
}