package com.stockly.service.impl.command;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Rate;
import com.easypost.model.Shipment;
import com.easypost.service.EasyPostClient;
import com.stockly.dto.ShipmentDTO;
import com.stockly.service.EasyPostService;
import com.stockly.service.command.ShipmentCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShipmentCommandServiceImpl implements ShipmentCommandService {

    @Value("${easypost.api.key}")
    private String apiKey;

    private final EasyPostService easyPostService;

    @Override
    public ShipmentDTO createShipment(Long orderId) throws EasyPostException {
        Shipment shipment = easyPostService.createShipmentFromOrder(orderId);
        return mapToDTO(shipment);
    }

    @Override
    public ShipmentDTO updateShipment(String shipmentId, String newRateId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(apiKey);
        Shipment shipment = client.shipment.retrieve(shipmentId);
        Rate newRate = shipment.getRates().stream()
                .filter(rate -> rate.getId().equals(newRateId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rate not found"));

        shipment = client.shipment.buy(shipmentId, Map.of("rate", newRate));
        return mapToDTO(shipment);
    }

    @Override
    public void deleteShipment(String shipmentId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(apiKey);
        Shipment shipment = client.shipment.retrieve(shipmentId);

        if (shipment.getPostageLabel() != null) {
            client.shipment.refund(shipmentId);
        } else {
            throw new IllegalStateException("Shipment has no purchasable label to void.");
        }
    }


    private ShipmentDTO mapToDTO(Shipment shipment) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setId(shipment.getId());
        dto.setTrackingCode(shipment.getTrackingCode());
        dto.setStatus(shipment.getStatus());
        dto.setLabelUrl(shipment.getPostageLabel() != null ? shipment.getPostageLabel().getLabelUrl() : null);

        if (shipment.getSelectedRate() != null) {
            dto.setRate(shipment.getSelectedRate().getRate());
            dto.setCarrier(shipment.getSelectedRate().getCarrier());
            dto.setService(shipment.getSelectedRate().getService());
        }

        return dto;
    }
}
