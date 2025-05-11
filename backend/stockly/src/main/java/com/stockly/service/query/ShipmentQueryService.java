package com.stockly.service.query;

import com.easypost.exception.EasyPostException;
import com.stockly.dto.ShipmentDTO;
import com.easypost.model.Tracker;
import com.stockly.dto.TrackerDTO;

public interface ShipmentQueryService {
    ShipmentDTO getShipmentById(String shipmentId) throws EasyPostException;
    TrackerDTO trackShipment(String shipmentId) throws EasyPostException;
    ShipmentDTO getShipmentByOrderId(Long orderId) throws EasyPostException; // Optional
}
