package com.stockly.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "receipts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {

    @Id
    private Long orderId; // Assuming receipt is generated per order

    @Temporal(TemporalType.TIMESTAMP)
    private Instant orderDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date deliveryDate;

    private String status;

    // Save historical summary from Company — not mapped as full entity
    @ManyToOne
    @JoinColumn(name = "buyer_id")
    private Company buyer;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Company supplier;

    // Historical snapshots
    private String buyerCompanyName;
    private String buyerEmail;
    private String buyerPhoneNumber;
    private String buyerAddress;
    private String buyerCompanyType;

    private String supplierCompanyName;
    private String supplierEmail;
    private String supplierPhoneNumber;
    private String supplierAddress;
    private String supplierCompanyType;

    private BigDecimal totalPrice;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReceiptItem> items;
}

