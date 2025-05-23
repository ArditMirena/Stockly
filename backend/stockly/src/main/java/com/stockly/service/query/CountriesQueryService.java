package com.stockly.service.query;

import com.stockly.model.Country;

import java.util.List;

public interface CountriesQueryService {
    List<Country> getAllCountries();
    Country getCountryById(Long id);
    List<Country> searchCountries(String searchTerm);
}