package com.stockly.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<WarehouseProduct> warehouseProducts = new ArrayList<>();

    public void addWarehouseProduct(WarehouseProduct warehouseProduct) {
        if (warehouseProduct == null) {
            throw new IllegalArgumentException("WarehouseProduct cannot be null");
        }

        if (warehouseProducts == null) {
            warehouseProducts = new ArrayList<>();
        }

        // Check if the product already exists in this warehouse
        boolean productExists = warehouseProducts.stream()
                .anyMatch(wp -> wp.getProduct().equals(warehouseProduct.getProduct()));

        if (!productExists) {
            // Set the warehouse reference
            warehouseProduct.setWarehouse(this);
            // Add to the collection
            warehouseProducts.add(warehouseProduct);
            // Update availability status
            warehouseProduct.updateAvailability();
        }
    }

}
