package com.stockly.service.impl;

import com.easypost.exception.EasyPostException;
import com.easypost.model.Address;
import com.easypost.model.Parcel;
import com.easypost.model.Rate;
import com.easypost.model.Tracker;
import com.easypost.service.EasyPostClient;
import com.stockly.model.*;
import com.stockly.repository.AddressRepository;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.ShipmentRepository;
import com.stockly.service.EasyPostService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EasyPostServiceImpl implements EasyPostService {

    @Value("${easypost.api.key}")
    private String easypostApiKey;

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public Shipment createShipmentFromOrder(Long orderId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(easypostApiKey);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        var supplierCompany = order.getSupplier();
        var buyerCompany = order.getBuyer();

        Address from = createEasyPostAddress(client, supplierCompany, supplierCompany.getAddress());
        Address to = createEasyPostAddress(client, buyerCompany, buyerCompany.getAddress());

        Parcel parcel = createEasyPostParcel(client, order);

        Map<String, Object> shipmentParams = new HashMap<>();
        shipmentParams.put("from_address", from);
        shipmentParams.put("to_address", to);
        shipmentParams.put("parcel", parcel);

        com.easypost.model.Shipment epShipment = client.shipment.create(shipmentParams);

        List<Rate> rates = epShipment.getRates();
        if (rates == null || rates.isEmpty()) {
            throw new RuntimeException("No rates returned for shipment. Check address and parcel data.");
        }

        Rate selectedRate = rates.get(0);
        Map<String, Object> buyParams = new HashMap<>();
        buyParams.put("rate", selectedRate);
        epShipment = client.shipment.buy(epShipment.getId(), buyParams);

        // Persist to DB
        Shipment shipment = Shipment.builder()
                .order(order)
                .fromAddress(supplierCompany.getAddress())
                .toAddress(buyerCompany.getAddress())
                .carrier(selectedRate.getCarrier())
                .trackingNumber(epShipment.getTrackingCode())
                .labelUrl(epShipment.getPostageLabel().getLabelUrl())
                .status("CREATED")
                .estimatedDeliveryDate(null)
                .shippingCost(new BigDecimal(selectedRate.getRate()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .easypostShipmentId(epShipment.getId())
                .build();

        return shipmentRepository.save(shipment);
    }

    public Tracker getTrackingInfo(String easypostShipmentId) throws EasyPostException {
        EasyPostClient client = new EasyPostClient(easypostApiKey);
        com.easypost.model.Shipment epShipment = client.shipment.retrieve(easypostShipmentId);
        return epShipment.getTracker();
    }

    private Address createEasyPostAddress(EasyPostClient client, Company company, com.stockly.model.Address appAddress) throws EasyPostException {
        City city = appAddress.getCity();
        Country country = city.getCountry();

        Map<String, Object> addressParams = new HashMap<>();
        addressParams.put("name", company.getCompanyName());
        addressParams.put("street1", appAddress.getStreet());
        addressParams.put("city", city.getName());
        addressParams.put("state", "US");
        addressParams.put("zip", appAddress.getPostalCode());
        addressParams.put("country", country.getIsoCode());
        addressParams.put("phone", company.getPhoneNumber() != null ? company.getPhoneNumber() : "0000000000");
        addressParams.put("email", company.getEmail() != null ? company.getEmail() : "placeholder@example.com");

        return client.address.create(addressParams);
    }

    private Parcel createEasyPostParcel(EasyPostClient client, Order order) throws EasyPostException {
        // Initialize with reasonable minimums for EasyPost Parcel
        double totalWeight = 8.0; // in ounces
        double totalWidth = 5.0;  // in inches
        double totalHeight = 5.0; // in inches
        double totalLength = 5.0; // in inches

        boolean hasCustomDimensions = false;

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int quantity = item.getQuantity();

            Double weight = product.getWeight();
            if (weight != null && weight > 0) {
                totalWeight += weight * quantity;
            }

            Dimension dim = product.getDimensions();
            if (dim != null) {
                if (dim.getWidth() != null && dim.getWidth() > 0) {
                    totalWidth = Math.max(totalWidth, dim.getWidth());
                    hasCustomDimensions = true;
                }
                if (dim.getHeight() != null && dim.getHeight() > 0) {
                    totalHeight = Math.max(totalHeight, dim.getHeight());
                    hasCustomDimensions = true;
                }
                if (dim.getDepth() != null && dim.getDepth() > 0) {
                    totalLength = Math.max(totalLength, dim.getDepth());
                    hasCustomDimensions = true;
                }
            }
        }

        totalWidth = Math.max(totalWidth, 5.0);
        totalHeight = Math.max(totalHeight, 5.0);
        totalLength = Math.max(totalLength, 5.0);
        totalWeight = Math.max(totalWeight, 8.0);

        totalWidth = Math.round(totalWidth * 100) / 100.0;
        totalHeight = Math.round(totalHeight * 100) / 100.0;
        totalLength = Math.round(totalLength * 100) / 100.0;
        totalWeight = Math.round(totalWeight * 100) / 100.0;

        Map<String, Object> parcelParams = new HashMap<>();
        parcelParams.put("length", totalLength);
        parcelParams.put("width", totalWidth);
        parcelParams.put("height", totalHeight);
        parcelParams.put("weight", totalWeight);

        return client.parcel.create(parcelParams);
    }

}
