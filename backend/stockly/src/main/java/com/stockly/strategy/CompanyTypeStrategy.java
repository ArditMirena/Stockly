package com.stockly.strategy;

import com.stockly.model.Company;

public interface CompanyTypeStrategy {
    void apply(Company company);
}