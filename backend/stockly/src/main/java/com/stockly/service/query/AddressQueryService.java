package com.stockly.service.query;

import com.stockly.dto.AddressDTO;

import java.util.List;

public interface AddressQueryService {
    AddressDTO getAddressById(Long id);
    List<AddressDTO> getAllAddresses();
    List<AddressDTO> getAddressesByCityId(Long cityId);
    List<AddressDTO> searchByStreet(String partialStreet);
}