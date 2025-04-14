package com.stockly.boostrap;

import com.stockly.dto.CountryCityDTO;
import com.stockly.model.City;
import com.stockly.model.Country;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CountryRepository;
import com.stockly.response.ExternalCountryResponse;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CountrySeeder implements ApplicationListener<ContextRefreshedEvent> {

    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;
    private final RestTemplate restTemplate;

    public CountrySeeder(CountryRepository countryRepository, CityRepository cityRepository, RestTemplate restTemplate) {
        this.countryRepository = countryRepository;
        this.cityRepository = cityRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        this.loadCountriesAndCities();
    }

    private void loadCountriesAndCities() {
        String url = "https://countriesnow.space/api/v0.1/countries";

        ExternalCountryResponse response = restTemplate.getForObject(url, ExternalCountryResponse.class);
        if (response == null || response.getData() == null) return;

        for (CountryCityDTO dto : response.getData()) {
            if (countryRepository.findByName(dto.getCountry()).isPresent()) {
                continue;
            }

            Country country = new Country();
            country.setName(dto.getCountry());

            List<City> cities = dto.getCities().stream().map(cityName -> {
                City city = new City();
                city.setName(cityName);
                city.setCountry(country);
                return city;
            }).collect(Collectors.toList());

            country.setCities(cities);
            countryRepository.save(country); // will cascade save cities
        }
        
    }


}
