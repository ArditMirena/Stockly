package com.stockly.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    @Column(name = "address")
    private String address;

    @Column(name = "company_type")
    private String companyType;

    @Column(name = "business_type")
    private String businessType; // For Buyer

    @Column(name = "warehouse_id")
    private Long warehouseId; // For Supplier

    // Relationship with orders (Buyer)
    @OneToMany(mappedBy = "buyer")
    private List<Order> ordersAsBuyer;

    // Relationship with orders (Supplier)
    @OneToMany(mappedBy = "supplier")
    private List<Order> ordersAsSupplier;
}