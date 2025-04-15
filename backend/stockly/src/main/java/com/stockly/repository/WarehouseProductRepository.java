package com.stockly.repository;

import com.stockly.model.Product;
import com.stockly.model.WarehouseProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseProductRepository extends JpaRepository<WarehouseProduct, Long> {

    @Query("SELECT p FROM Product p JOIN WarehouseProduct wp ON p.id = wp.product.id WHERE wp.warehouse.id = :warehouseId AND wp.availability = :availability")
    List<Product> findProductsByWarehouseAndAvailability(@Param("warehouseId") Long warehouseId, @Param("availability") String availability);

    // Custom method to find a WarehouseProduct by warehouseId and productId
    @Query("SELECT wp FROM WarehouseProduct wp WHERE wp.warehouse.id = :warehouseId AND wp.product.id = :productId")
    Optional<WarehouseProduct> findByWarehouseIdAndProductId(@Param("warehouseId") Long warehouseId, @Param("productId") Long productId);
}
