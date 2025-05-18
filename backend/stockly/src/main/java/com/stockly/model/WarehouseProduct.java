package com.stockly.model;

import com.stockly.model.enums.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "availability", nullable = false)
    private String availability;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Instant updatedAt;

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
