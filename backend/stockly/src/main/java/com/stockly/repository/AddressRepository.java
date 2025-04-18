package com.stockly.repository;

import com.stockly.model.Address;
import com.stockly.model.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    // Find all addresses by a specific city
    List<Address> findAllByCity(City city);

    // Find address by city ID
    List<Address> findAllByCityId(Long cityId);

    // Find by street name (exact match)
    List<Address> findByStreet(String street);

    // Find by postal code
    List<Address> findByPostalCode(String postalCode);

    // Find by city and postal code
    List<Address> findByCityIdAndPostalCode(Long cityId, String postalCode);

    // Find by street containing (for partial match / search)
    List<Address> findByStreetContainingIgnoreCase(String partialStreet);

    // Optional: Get one by exact match
    Optional<Address> findByStreetAndPostalCodeAndCityId(String street, String postalCode, Long cityId);
}
