package com.stockly.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.stockly.model.enums.OrderStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "orders")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "buyer_id", referencedColumnName = "id")
    private Company buyer;

    @ManyToOne
    @JoinColumn(name = "supplier_id", referencedColumnName = "id")
    private Company supplier;

    @Column(name = "order_date")
    @CreationTimestamp
    private Instant orderDate;

    @Column(name = "delivery_date")
    private Date deliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Date updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Helper method to add items
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        this.totalPrice = calculateOrderTotal();
    }

    // Helper method to calculate order total
    public BigDecimal calculateOrderTotal() {
        return items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
