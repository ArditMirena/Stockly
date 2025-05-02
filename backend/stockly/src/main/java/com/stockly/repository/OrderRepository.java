package com.stockly.repository;

import com.stockly.model.Order;
import com.stockly.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

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
















}