package com.stockly.mapper;

import com.stockly.dto.AddressDTO;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AddressMapper {


    public Address toEntity(AddressDTO dto, City city) {
        if (dto == null) return null;



        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setPostalCode(dto.getPostalCode());
        address.setCity(city);

        return address;
    }

    public AddressDTO toDto(Address address) {
        if (address == null) return null;

        if (address.getCity() == null) {
            throw new IllegalStateException("Address entity has no associated city");
        }

        AddressDTO dto = new AddressDTO();
        dto.setStreet(address.getStreet());
        dto.setPostalCode(address.getPostalCode());
        dto.setCityId(address.getCity().getId());

        return dto;
    }

}
