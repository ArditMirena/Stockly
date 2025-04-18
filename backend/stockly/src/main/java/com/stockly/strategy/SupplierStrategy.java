package com.stockly.strategy;

import com.stockly.model.Company;
import com.stockly.model.Warehouse;

public class SupplierStrategy implements CompanyTypeStrategy {

    private final Long warehouseId;

    public SupplierStrategy(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    @Override
    public void applyAttributes(Company company) {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(warehouseId); // assuming you want to link to an existing warehouse
        company.getWarehouses().add(warehouse);
    }
}