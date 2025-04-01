package com.stockly.factory;

import com.stockly.strategy.BuyerStrategy;
import com.stockly.strategy.CompanyTypeStrategy;
import com.stockly.strategy.SupplierStrategy;

public class CompanyTypeStrategyFactory {

    public static CompanyTypeStrategy getStrategy(String companyType, String businessType, Long warehouseId) {
        if ("buyer".equalsIgnoreCase(companyType)) {
            return new BuyerStrategy(businessType);
        } else if ("supplier".equalsIgnoreCase(companyType)) {
            return new SupplierStrategy(warehouseId);
        } else {
            throw new IllegalArgumentException("Invalid companyType: " + companyType);
        }
    }
}