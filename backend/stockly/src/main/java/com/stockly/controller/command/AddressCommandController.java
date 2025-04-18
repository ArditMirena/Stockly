package com.stockly.controller.command;

import com.stockly.dto.AddressDTO;
import com.stockly.service.command.AddressCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressCommandController {

    private final AddressCommandService addressCommandService;

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@RequestBody AddressDTO addressDTO) {
        return ResponseEntity.ok(addressCommandService.createAddress(addressDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressDTO addressDTO
    ) {
        return ResponseEntity.ok(addressCommandService.updateAddress(id, addressDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressCommandService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
