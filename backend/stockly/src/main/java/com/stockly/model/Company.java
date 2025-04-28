package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "company")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "company_name", unique = true, nullable = false)
    private String companyName;

    @ManyToOne(cascade = {})
    @JoinColumn(name = "manager_id", referencedColumnName = "id")
    private User manager;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number", unique = true)
    private String phoneNumber;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @Column(name = "company_type")
    private String companyType;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "business_type")
    private String businessType; // For Buyer

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Warehouse> warehouses = new ArrayList<>(); // For Supplier

    // Relationship with orders (Buyer)
    @OneToMany(mappedBy = "buyer")
    private List<Order> ordersAsBuyer;

    // Relationship with orders (Supplier)
    @OneToMany(mappedBy = "supplier")
    private List<Order> ordersAsSupplier;


    public void addWarehouse(Warehouse warehouse) {
        if (warehouse != null) {
            warehouse.setCompany(this);
            warehouses.add(warehouse);
            determineCompanyType();
        }
    }

    public void determineCompanyType() {
        if (!warehouses.isEmpty()) {
            this.companyType = "SUPPLIER";
        } else if (businessType != null && !businessType.isEmpty()) {
            this.companyType = "BUYER";
        } else {
            this.companyType = null;
        }
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
        determineCompanyType();
    }


    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        determineCompanyType();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        determineCompanyType();
    }

    @PostLoad
    protected void onLoad() {
        determineCompanyType();
    }
}