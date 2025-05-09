package com.stockly.service;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Shipment;

public interface EasyPostService {
    Shipment createShipmentFromOrder(Long orderId) throws EasyPostException;
}
