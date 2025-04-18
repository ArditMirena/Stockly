package com.stockly.service.impl.query;

import com.stockly.dto.AddressDTO;
import com.stockly.mapper.AddressMapper;
import com.stockly.model.Address;
import com.stockly.repository.AddressRepository;
import com.stockly.service.query.AddressQueryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressQueryServiceImpl implements AddressQueryService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    @Override
    public AddressDTO getAddressById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));
        return addressMapper.toDto(address);
    }

    @Override
    public List<AddressDTO> getAllAddresses() {
        return addressRepository.findAll()
                .stream()
                .map(addressMapper::toDto)
                .toList();
    }

    @Override
    public List<AddressDTO> getAddressesByCityId(Long cityId) {
        return addressRepository.findAllByCityId(cityId)
                .stream()
                .map(addressMapper::toDto)
                .toList();
    }

    @Override
    public List<AddressDTO> searchByStreet(String partialStreet) {
        return addressRepository.findByStreetContainingIgnoreCase(partialStreet)
                .stream()
                .map(addressMapper::toDto)
                .toList();
    }
}
