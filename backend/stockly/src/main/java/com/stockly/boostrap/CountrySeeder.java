package com.stockly.boostrap;

import com.stockly.dto.CountryCityDTO;
import com.stockly.model.City;
import com.stockly.model.Country;
import com.stockly.repository.CityRepository;
import com.stockly.repository.CountryRepository;
import com.stockly.response.ExternalCountryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CountrySeeder implements ApplicationListener<ContextRefreshedEvent> {

    private final CountryRepository countryRepository;
    private final RestTemplate restTemplate;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        this.loadCountriesAndCities();
    }

    private void loadCountriesAndCities() {
        if (countryRepository.count() > 0) {
            return;
        }

        String url = "https://countriesnow.space/api/v0.1/countries";
        ExternalCountryResponse response = restTemplate.getForObject(url, ExternalCountryResponse.class);

        if (response == null || response.getData() == null) return;

        for (CountryCityDTO dto : response.getData()) {
            Country country = new Country();
            country.setName(dto.getCountry());

            List<City> cities = dto.getCities().stream().map(cityName -> {
                City city = new City();
                city.setName(cityName);
                city.setCountry(country);
                return city;
            }).collect(Collectors.toList());

            country.setCities(cities);
            countryRepository.save(country);
        }

        updateCountryIsoCodes();
    }

    private void updateCountryIsoCodes() {
        String restCountriesUrl = "https://restcountries.com/v3.1/all";
        var response = restTemplate.getForObject(restCountriesUrl, List.class);

        if (response == null) return;

        for (Object obj : response) {
            if (obj instanceof LinkedHashMap map) {
                try {
                    String nameCommon = ((Map<String, Object>) map.get("name")).get("common").toString();
                    String cca2 = (String) map.get("cca2");

                    countryRepository.findByName(nameCommon).ifPresent(country -> {
                        country.setIsoCode(cca2);
                        countryRepository.save(country);
                    });
                } catch (Exception ignored) {
                }
            }
        }
    }
}
