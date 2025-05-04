package com.stockly.service;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Tracker;
import com.stockly.model.Order;
import com.stockly.model.Shipment;

public interface EasyPostService {
    Shipment createShipmentFromOrder(Long orderId) throws EasyPostException;
    Tracker getTrackingInfo(String easypostShipmentId) throws EasyPostException;
}
