package com.stockly.service.impl.query;

import com.stockly.exception.ResourceNotFoundException;
import com.stockly.model.City;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CountryRepository;
import com.stockly.service.query.CitiesQueryService;
import com.stockly.specification.CitySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CitiesQueryServiceImpl implements CitiesQueryService {
    private final CityRepository cityRepository;

    @Override
    public City getCity(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with id: "+id));
    }

    @Override
    public List<City> getCities() {
        return cityRepository.findAll();
    }

    @Override
    public List<City> getCitiesByCountry(Long countryId) {
        return cityRepository.findByCountryId(countryId)
                .orElseThrow(() -> new ResourceNotFoundException("Country not found with id: "+ countryId));
    }

    @Override
    public List<City> searchCities(String searchTerm) {
        final Specification<City> specification = CitySpecification.unifiedSearch(searchTerm);
        final List<City> cities = cityRepository.findAll(specification);
        return cities;
    }
}
