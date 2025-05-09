package com.stockly.service;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Shipment;
import com.easypost.model.Tracker;

public interface EasyPostService {
    Shipment createShipmentFromOrder(Long orderId) throws EasyPostException;
}
