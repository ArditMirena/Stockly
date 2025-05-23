package com.stockly.service.query;

import com.stockly.model.City;

import java.util.List;

public interface CitiesQueryService {
    City getCity(Long id);
    List<City> getCities();
    List<City> getCitiesByCountry(Long countryId);
    List<City> searchCities(String searchTerm);
}