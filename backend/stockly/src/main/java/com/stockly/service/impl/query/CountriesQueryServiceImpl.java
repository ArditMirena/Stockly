package com.stockly.service.impl.query;

import com.stockly.exception.ResourceNotFoundException;
import com.stockly.model.Country;
import com.stockly.repository.CountryRepository;
import com.stockly.service.query.CountriesQueryService;
import com.stockly.specification.CountrySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CountriesQueryServiceImpl implements CountriesQueryService {
    private final CountryRepository countryRepository;

    @Override
    public List<Country> getAllCountries() {
        return countryRepository.findAll();
    }

    @Override
    public List<Country> searchCountries(String searchTerm) {
        final Specification<Country> specification = CountrySpecification.unifiedSearch(searchTerm);
        final List<Country> countries = countryRepository.findAll(specification);
        return countries;
    }

    @Override
    public Country getCountryById(Long id) {
        return countryRepository.findById(id).
                orElseThrow(() -> new ResourceNotFoundException("Country not found with id: "+id));
    }
}
