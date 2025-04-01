package com.stockly.strategy;

import com.stockly.model.Company;

public class SupplierStrategy implements CompanyTypeStrategy {

    private final Long warehouseId;

    public SupplierStrategy(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    @Override
    public void applyAttributes(Company company) {
        company.setWarehouseId(warehouseId); // Add warehouseId attribute in Company
    }
}