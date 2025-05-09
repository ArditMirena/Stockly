package com.stockly.service.impl.query;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Shipment;
import com.easypost.service.EasyPostClient;
import com.stockly.dto.ShipmentDTO;
import com.stockly.dto.TrackerDTO;
import com.stockly.model.Order;
import com.stockly.repository.OrderRepository;
import com.stockly.service.query.ShipmentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShipmentQueryServiceImpl implements ShipmentQueryService {

    @Value("${easypost.api.key}")
    private String easypostApiKey;

    private final OrderRepository orderRepository;

    @Override
    public ShipmentDTO getShipmentById(String shipmentId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(easypostApiKey);
        Shipment shipment = client.shipment.retrieve(shipmentId);

        return ShipmentDTO.builder()
                .id(shipment.getId())
                .trackingCode(shipment.getTrackingCode())
                .status(shipment.getStatus())
                .labelUrl(shipment.getPostageLabel() != null ? shipment.getPostageLabel().getLabelUrl() : null)
                .rate(Float.valueOf(shipment.getSelectedRate().getRate()))
                .carrier(shipment.getSelectedRate().getCarrier())
                .service(shipment.getSelectedRate().getService())
                .build();
    }

    @Override
    public TrackerDTO trackShipment(String shipmentId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(easypostApiKey);
        Shipment shipment = client.shipment.retrieve(shipmentId);

        return TrackerDTO.builder()
                .trackingCode(shipment.getTrackingCode())
                .status(shipment.getStatus())
                .carrier(shipment.getTracker().getCarrier())
                .publicUrl(shipment.getTracker().getPublicUrl())
                .build();
    }

    @Override
    public ShipmentDTO getShipmentByOrderId(Long orderId) throws EasyPostException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String shipmentId = order.getShipmentId(); // Assumes this exists in the Order entity
        if (shipmentId == null) {
            throw new IllegalStateException("Order does not have an associated shipment");
        }

        return getShipmentById(shipmentId);
    }
}
