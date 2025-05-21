package com.stockly.factory;

import com.stockly.strategy.BuyerStrategy;
import com.stockly.strategy.CompanyTypeStrategy;
import com.stockly.strategy.ManufacturerStrategy;
import com.stockly.strategy.SupplierStrategy;
import com.stockly.model.Company;

public class CompanyTypeStrategyFactory {
    public static CompanyTypeStrategy getStrategy(Company company) {
        if (company == null) {
            throw new IllegalArgumentException("Company cannot be null");
        }

        // Manufacturer
        if (company.isHasProductionFacility() && !company.getWarehouses().isEmpty()) {
            return new ManufacturerStrategy();
        }

        // Supplier
        if (!company.isHasProductionFacility() && !company.getWarehouses().isEmpty()) {
            return new SupplierStrategy();
        }

        // Buyer
        if (company.getBusinessType() != null && !company.getBusinessType().isEmpty()) {
            return new BuyerStrategy();
        }

        return null;
    }
}