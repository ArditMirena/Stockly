package com.stockly.repository;

import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.projection.ProductWarehouseProjection;
import com.stockly.projection.StockChangeProjection;
import com.stockly.projection.WarehouseStockProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface WarehouseProductRepository extends JpaRepository<WarehouseProduct, Long> {

    List<WarehouseProduct> findByWarehouseId(Long warehouseId);


    @Query("SELECT p FROM Product p JOIN WarehouseProduct wp ON p.id = wp.product.id WHERE wp.warehouse.id = :warehouseId AND wp.availability = :availability")
    List<Product> findProductsByWarehouseAndAvailability(@Param("warehouseId") Long warehouseId, @Param("availability") String availability);

    // Custom method to find a WarehouseProduct by warehouseId and productId
    @Query("SELECT wp FROM WarehouseProduct wp WHERE wp.warehouse.id = :warehouseId AND wp.product.id = :productId")
    Optional<WarehouseProduct> findByWarehouseIdAndProductId(@Param("warehouseId") Long warehouseId, @Param("productId") Long productId);

    Optional<WarehouseProduct> findByWarehouseAndProduct(Warehouse warehouse, Product product);


    Optional<WarehouseProduct> findByProduct(Product product);


    @Query("""
    SELECT 
        wp.product.id as productId, 
        wp.warehouse.id as warehouseId
    FROM WarehouseProduct wp
    WHERE wp.product.id IN :productIds
    AND wp.quantity > 0  
""")
    List<ProductWarehouseProjection> findWarehousesByProductIds(@Param("productIds") Set<Long> productIds);

    @Query("SELECT COALESCE(SUM(wp.quantity), 0) FROM WarehouseProduct wp WHERE wp.product.id = :productId AND wp.warehouse.id = :warehouseId")
    Integer findStock(@Param("productId") Long productId, @Param("warehouseId") Long warehouseId);

    @Query("""
        SELECT 
            wp.product.id as productId,
            wp.warehouse.id as warehouseId,
            SUM(wp.quantity) as currentStock
        FROM WarehouseProduct wp
        WHERE (wp.product.id, wp.warehouse.id) IN (
            SELECT oi.product.id, o.sourceWarehouse.id 
            FROM Order o JOIN o.items oi 
            WHERE o.orderDate >= :startDate
        )
        GROUP BY wp.product.id, wp.warehouse.id
    """)
    List<WarehouseStockProjection> findCurrentStockLevels(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT 
            wp.product.id as productId,
            wp.warehouse.id as warehouseId,
            SUM(wp.quantity) as currentStock
        FROM WarehouseProduct wp
        WHERE wp.product.id = :productId
        AND wp.warehouse.id = :warehouseId
        GROUP BY wp.product.id, wp.warehouse.id
    """)
    Optional<WarehouseStockProjection> findStockByProductAndWarehouse(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId
    );

    @Query(value = """
        SELECT 
            oi.product_id as productId,
            o.warehouse_id as warehouseId,
            o.order_date as timestamp,
            -oi.quantity as quantityChange,
            'ORDER' as changeType
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.order_date >= :startDate
        
        UNION ALL
        
        SELECT 
            wp.product_id as productId,
            wp.warehouse_id as warehouseId,
            wp.updated_at as timestamp,
            wp.quantity as quantityChange,
            'RESTOCK' as changeType
        FROM warehouse_products wp
        WHERE wp.updated_at >= :startDate
        
        ORDER BY timestamp
    """, nativeQuery = true)
    List<StockChangeProjection> findStockChanges(@Param("startDate") Instant startDate);

    @Query(value = """
        SELECT 
            oi.product_id as productId,
            o.warehouse_id as warehouseId,
            o.order_date as timestamp,
            -oi.quantity as quantityChange,
            'ORDER' as changeType
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id
        
        UNION ALL
        
        SELECT 
            wp.product_id as productId,
            wp.warehouse_id as warehouseId,
            wp.updated_at as timestamp,
            wp.quantity as quantityChange,
            'RESTOCK' as changeType
        FROM warehouse_product wp
        
        ORDER BY timestamp
    """, nativeQuery = true)
    List<StockChangeProjection> findAllStockChanges();

    @Query("""
        SELECT COALESCE(SUM(wp.quantity), 0)
        FROM WarehouseProduct wp
        WHERE wp.product.id = :productId
        AND wp.warehouse.id = :warehouseId
        AND (wp.updatedAt < :cutoffDate OR wp.updatedAt IS NULL)
    """)
    int findStockAtTime(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("cutoffDate") Instant cutoffDate
    );

    @Query("""
        SELECT COALESCE(SUM(wp.quantity), 0) 
        FROM WarehouseProduct wp 
        WHERE wp.product.id = :productId 
        AND wp.warehouse.id = :warehouseId
    """)
    int findInitialStock(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId
    );


    @Query("SELECT wp FROM WarehouseProduct wp " +
            "JOIN wp.warehouse w " +
            "JOIN w.company c " +
            "WHERE (:managerId IS NULL OR c.manager.id = :managerId) " +
            "AND (:warehouseId IS NULL OR wp.warehouse.id = :warehouseId)")
    Page<WarehouseProduct> findByFilters(
            @Param("managerId") Long managerId,
            @Param("warehouseId") Long warehouseId,
            Pageable pageable
    );

}

