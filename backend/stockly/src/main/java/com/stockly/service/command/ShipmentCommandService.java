package com.stockly.service.command;

import com.easypost.exception.EasyPostException;
import com.stockly.dto.ShipmentDTO;

public interface ShipmentCommandService {
    ShipmentDTO createShipment(Long orderId) throws EasyPostException;
    ShipmentDTO updateShipment(String shipmentId, String newRateId) throws EasyPostException;
    void deleteShipment(String shipmentId) throws EasyPostException;
}
