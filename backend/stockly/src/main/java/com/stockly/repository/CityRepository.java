package com.stockly.repository;

import com.stockly.model.City;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<List<City>> findByCountryId(Long countryId);
    List<City> findAll(Specification<City> specification);
}
