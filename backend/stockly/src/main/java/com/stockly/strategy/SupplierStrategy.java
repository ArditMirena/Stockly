package com.stockly.strategy;

import com.stockly.model.Company;
import com.stockly.model.Warehouse;

public class SupplierStrategy implements CompanyTypeStrategy {
    @Override
    public void apply(Company company) {
        // Additional supplier-specific logic can go here
        company.setCompanyType("SUPPLIER");
    }
}