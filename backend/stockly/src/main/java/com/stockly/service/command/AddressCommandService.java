package com.stockly.service.command;

import com.stockly.dto.AddressDTO;

public interface AddressCommandService {
    AddressDTO createAddress(AddressDTO addressDTO);
    AddressDTO updateAddress(Long id, AddressDTO addressDTO);
    void deleteAddress(Long id);
}
