package com.stockly.controller.command;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Tracker;
import com.stockly.dto.ShipmentDTO;
import com.stockly.service.EasyPostService;
import com.stockly.service.command.ShipmentCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentCommandController {

    private final ShipmentCommandService shipmentCommandService;

    @PostMapping()
    public ResponseEntity<ShipmentDTO> createShipment(@RequestParam Long orderId) throws EasyPostException {
        ShipmentDTO shipmentDTO = shipmentCommandService.createShipment(orderId);
        return new ResponseEntity<>(shipmentDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShipmentDTO> updateShipment(@Valid @PathVariable String shipmentId, String newRateId) throws EasyPostException {
        ShipmentDTO shipmentDTO = shipmentCommandService.updateShipment(shipmentId, newRateId);
        return new ResponseEntity<>(shipmentDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShipment(@Valid @PathVariable String shipmentId) throws EasyPostException {
        shipmentCommandService.deleteShipment(shipmentId);
        return ResponseEntity.noContent().build();
    }
}
