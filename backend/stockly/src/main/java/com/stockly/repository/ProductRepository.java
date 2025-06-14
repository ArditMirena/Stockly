package com.stockly.repository;

import com.stockly.model.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAll(Specification<Product> specification);
    Optional<Product> findBySku(String sku);


    @Query("SELECT p FROM Product p JOIN WarehouseProduct wp ON p.id = wp.product.id WHERE wp.warehouse.id = :warehouseId")
    List<Product> findProductsByWarehouseId(@Param("warehouseId") Long warehouseId);
}
