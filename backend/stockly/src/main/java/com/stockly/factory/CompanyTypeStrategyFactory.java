package com.stockly.factory;

import com.stockly.strategy.BuyerStrategy;
import com.stockly.strategy.CompanyTypeStrategy;
import com.stockly.strategy.SupplierStrategy;
import com.stockly.model.Company;

public class CompanyTypeStrategyFactory {
    public static CompanyTypeStrategy getStrategy(Company company) {
        if (company == null) {
            return null;
        }

        if (!company.getWarehouses().isEmpty()) {
            return new SupplierStrategy();
        }

        if (company.getBusinessType() != null && !company.getBusinessType().isEmpty()) {
            return new BuyerStrategy();
        }

        return null;
    }
}