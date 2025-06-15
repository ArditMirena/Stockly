package com.stockly.repository;

import com.stockly.dto.OrderExportDTO;
import com.stockly.model.Order;
import com.stockly.model.enums.OrderStatus;
import com.stockly.projection.FlatOrderProjection;
import com.stockly.projection.OrderExportProjection;
import com.stockly.projection.OrderProjection;
import com.stockly.projection.OrderStockProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // Find all orders by buyer ID
    List<Order> findByBuyerId(Long buyerId);

    // Find all orders by supplier ID
    List<Order> findBySupplierId(Long supplierId);

    // Find orders by status
    List<Order> findByStatus(String status);

    // Find orders between dates
    List<Order> findByOrderDateBetween(Date startDate, Date endDate);

    // Find orders by buyer and status
    List<Order> findByBuyerIdAndStatus(Long buyerId, String status);

    // Find orders by supplier and status
    List<Order> findBySupplierIdAndStatus(Long supplierId, String status);

    // Custom query to find orders with total price greater than
    @Query("SELECT o FROM Order o WHERE o.totalPrice > :price")
    List<Order> findOrdersWithTotalPriceGreaterThan(@Param("price") BigDecimal price);

    // Count orders by buyer
    long countByBuyerId(Long buyerId);

    // Count orders by supplier
    long countBySupplierId(Long supplierId);

    // Count orders by status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);




    // New: Advanced search with pagination
    @Query("SELECT o FROM Order o WHERE " +
            "(:buyerId IS NULL OR o.buyer.id = :buyerId) AND " +
            "(:supplierId IS NULL OR o.supplier.id = :supplierId) AND " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:startDate IS NULL OR o.orderDate >= :startDate) AND " +
            "(:endDate IS NULL OR o.orderDate <= :endDate)")
    Page<Order> searchOrders(
            @Param("buyerId") Long buyerId,
            @Param("supplierId") Long supplierId,
            @Param("status") OrderStatus status,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            Pageable pageable
    );


    @Query(nativeQuery = true, value = """
    SELECT
        oi.product_id AS productId,
        o.source_warehouse_id AS warehouseId,
        o.order_date AS orderDate,
        oi.quantity AS quantity,
        wp.quantity AS current_db_stock,
        wp.quantity AS currentStock
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN warehouse_products wp ON 
        wp.product_id = oi.product_id AND 
        wp.warehouse_id = o.source_warehouse_id
    WHERE o.order_date >= :startDate
    ORDER BY o.order_date
    """)
    List<OrderExportProjection> findOrdersForExport(@Param("startDate") Instant startDate);


    @Query("""
    SELECT 
        o.id as orderId,
        o.sourceWarehouse.id as warehouseId,
        o.orderDate as orderDate,
        oi.product.id as productId,
        oi.quantity as quantity
    FROM Order o
    JOIN o.items oi
    WHERE o.orderDate >= :startDate
""")
    List<FlatOrderProjection> findRecentOrders(@Param("startDate") Instant startDate);

    @Query("""
        SELECT 
            oi.product.id as productId,
            o.sourceWarehouse.id as warehouseId,
            o.orderDate as orderDate,
            oi.quantity as quantity,
            (SELECT COALESCE(SUM(wp.quantity), 0)
             FROM WarehouseProduct wp
             WHERE wp.product.id = oi.product.id
             AND wp.warehouse.id = o.sourceWarehouse.id
             AND (wp.updatedAt < o.orderDate OR wp.updatedAt IS NULL)
            ) as stockAtTime
        FROM Order o
        JOIN o.items oi
        WHERE o.orderDate >= :startDate
    """)
    List<OrderStockProjection> findOrdersWithStock(@Param("startDate") Instant startDate);


    Page<Order> findAll(Specification<Order> spec, Pageable pageable);
}
