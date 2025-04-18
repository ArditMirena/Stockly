package com.stockly.service.impl.command;

import com.stockly.dto.AddressDTO;
import com.stockly.mapper.AddressMapper;
import com.stockly.model.Address;
import com.stockly.model.City;
import com.stockly.repository.AddressRepository;
import com.stockly.repository.CityRepository;
import com.stockly.service.command.AddressCommandService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AddressCommandServiceImpl implements AddressCommandService {

    private final AddressRepository addressRepository;
    private final CityRepository cityRepository;
    private final AddressMapper addressMapper;

    @Override
    public AddressDTO createAddress(AddressDTO addressDTO) {
        City city = cityRepository.findById(addressDTO.getCityId())
                .orElseThrow(() -> new EntityNotFoundException("City not found"));

        Address address = addressMapper.toEntity(addressDTO, city);
        address.setCity(city);

        return addressMapper.toDto(addressRepository.save(address));
    }

    @Override
    public AddressDTO updateAddress(Long id, AddressDTO addressDTO) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        address.setStreet(addressDTO.getStreet());
        address.setPostalCode(addressDTO.getPostalCode());

        if (addressDTO.getCityId() != null) {
            City city = cityRepository.findById(addressDTO.getCityId())
                    .orElseThrow(() -> new EntityNotFoundException("City not found"));
            address.setCity(city);
        }

        return addressMapper.toDto(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(Long id) {
        if (!addressRepository.existsById(id)) {
            throw new EntityNotFoundException("Address not found");
        }
        addressRepository.deleteById(id);
    }
}
