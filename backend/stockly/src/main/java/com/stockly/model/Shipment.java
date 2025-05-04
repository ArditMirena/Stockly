package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "shipments")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties("shipments")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "from_address_id")
    @JsonIgnoreProperties("shipments")
    private Address fromAddress;

    @ManyToOne
    @JoinColumn(name = "to_address_id")
    @JsonIgnoreProperties("shipments")
    private Address toAddress;

    @Column(name = "carrier")
    private String carrier;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "label_url")
    private String labelUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "estimated_delivery_date")
    private Instant estimatedDeliveryDate;

    @Column(name = "shipping_cost")
    private BigDecimal shippingCost;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "easypost_shipment_id")
    private String easypostShipmentId;
}
