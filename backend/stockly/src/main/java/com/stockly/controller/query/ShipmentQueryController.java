package com.stockly.controller.query;

import com.easypost.exception.EasyPostException;
import com.stockly.dto.ShipmentDTO;
import com.stockly.dto.TrackerDTO;
import com.stockly.service.query.ShipmentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentQueryController {
    private final ShipmentQueryService shipmentQueryService;

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getShipmentById(@PathVariable String id) throws EasyPostException {
        ShipmentDTO shipmentDTO = shipmentQueryService.getShipmentById(id);
        return ResponseEntity.ok(shipmentDTO);
    }

    @GetMapping("/track/{id}")
    public ResponseEntity<TrackerDTO> trackShipment(@PathVariable String id) throws EasyPostException {
        TrackerDTO trackerDTO = shipmentQueryService.trackShipment(id);
        return ResponseEntity.ok(trackerDTO);
    }
}
