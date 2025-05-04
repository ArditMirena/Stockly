package com.stockly.controller.command;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Tracker;
import com.stockly.model.Order;
import com.stockly.model.Shipment;
import com.stockly.service.EasyPostService;
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

    private final EasyPostService easyPostService;

    @PostMapping
    public ResponseEntity<?> createShipment(@RequestParam Long orderId) {
        try {
            Shipment shipment = easyPostService.createShipmentFromOrder(orderId);
            Map<String, Object> response = new HashMap<>();
            response.put("carrier", shipment.getCarrier());
            response.put("trackingNumber", shipment.getTrackingNumber());
            response.put("labelUrl", shipment.getLabelUrl());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Shipment creation failed", "message", e.getMessage()));
        }
    }


    @GetMapping("/{id}/track")
    public ResponseEntity<Tracker> trackShipment(@PathVariable String id) {
        try {
            Tracker tracker = easyPostService.getTrackingInfo(id);
            return ResponseEntity.ok(tracker);
        } catch (EasyPostException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
