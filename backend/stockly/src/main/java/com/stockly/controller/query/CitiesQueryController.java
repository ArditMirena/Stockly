package com.stockly.controller.query;

import com.stockly.model.City;
import com.stockly.service.query.CitiesQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
public class CitiesQueryController {

    private final CitiesQueryService citiesQueryService;

    @GetMapping
    public ResponseEntity<List<City>> getCities() {
        return ResponseEntity.ok(citiesQueryService.getCities());
    }

    @GetMapping("/country/{countryId}")
    public ResponseEntity<List<City>> getCitiesByCountryId(@PathVariable Long countryId) {
        return ResponseEntity.ok(citiesQueryService.getCitiesByCountry(countryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<City>> searchCities(@RequestParam(required = false) String searchTerm) {
        return ResponseEntity.ok(citiesQueryService.searchCities(searchTerm));
    }
}