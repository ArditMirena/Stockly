package com.stockly.controller.query;

import com.stockly.dto.AddressDTO;
import com.stockly.service.query.AddressQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressQueryController {

    private final AddressQueryService addressQueryService;

    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(addressQueryService.getAddressById(id));
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAll() {
        return ResponseEntity.ok(addressQueryService.getAllAddresses());
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<AddressDTO>> getByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(addressQueryService.getAddressesByCityId(cityId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AddressDTO>> searchByStreet(@RequestParam String q) {
        return ResponseEntity.ok(addressQueryService.searchByStreet(q));
    }
}
