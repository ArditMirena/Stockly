package com.stockly.controller.query;

import com.easypost.exception.EasyPostException;
import com.stockly.dto.ShipmentDTO;
import com.stockly.dto.TrackerDTO;
import com.stockly.service.query.ShipmentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/track")
    public ResponseEntity<TrackerDTO> trackShipment(@RequestParam String trackId) throws EasyPostException {
        TrackerDTO trackerDTO = shipmentQueryService.trackShipment(trackId);
        return ResponseEntity.ok(trackerDTO);
    }

    @GetMapping("/order")
    public ResponseEntity<ShipmentDTO> getShipmentByOrderId(@RequestParam Long orderId) throws EasyPostException {
        ShipmentDTO shipmentDTO = shipmentQueryService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(shipmentDTO);
    }
}
