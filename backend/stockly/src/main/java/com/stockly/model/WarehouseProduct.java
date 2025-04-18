package com.stockly.model;

import com.stockly.model.enums.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "warehouse_products")
@Getter
@Setter
public class WarehouseProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "availability", nullable = false)
    private String availability;


    public void updateAvailability() {
        if (quantity == null || quantity <= 0) {
            this.availability = AvailabilityStatus.OUT_OF_STOCK.name();
        } else if (quantity <= 20) {
            this.availability = AvailabilityStatus.LOW_IN_STOCK.name();
        } else {
            this.availability = AvailabilityStatus.IN_STOCK.name();
        }
    }


    // Automatically update availability when quantity is set
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        updateAvailability();
    }

}
