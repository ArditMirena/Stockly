package com.stockly.controller.query;

import com.stockly.model.Country;
import com.stockly.service.query.CountriesQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/countries")
@RequiredArgsConstructor
public class CountryQueryController {

    private final CountriesQueryService countriesQueryService;

    @GetMapping
    public ResponseEntity<List<Country>> getCountries() {
        return ResponseEntity.ok(countriesQueryService.getAllCountries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Country> getCountryById(@PathVariable Long id) {
        return ResponseEntity.ok(countriesQueryService.getCountryById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Country>> searchCountry(@RequestParam(required = false) String searchTerm) {
        return ResponseEntity.ok(countriesQueryService.searchCountries(searchTerm));
    }
}
