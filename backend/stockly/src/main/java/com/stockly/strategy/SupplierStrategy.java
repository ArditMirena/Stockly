package com.stockly.strategy;

import com.stockly.model.Company;
import com.stockly.model.Warehouse;

public class SupplierStrategy implements CompanyTypeStrategy {
    @Override
    public void apply(Company company) {
        company.setCompanyType("SUPPLIER");
    }
}