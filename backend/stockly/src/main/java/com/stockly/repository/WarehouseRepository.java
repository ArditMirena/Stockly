package com.stockly.repository;

import com.stockly.model.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long>, JpaSpecificationExecutor<Warehouse> {
    Optional<Warehouse> findByName(String name);
    List<Warehouse> findByCompanyId(Long companyId);
    boolean existsByName(String name);

    @Modifying
    @Query(value = "DELETE FROM warehouses WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") Long id);

    @Query("SELECT w FROM Warehouse w " +
            "WHERE (:companyId IS NULL OR w.company.id = :companyId) " +
            "AND (:managerId IS NULL OR w.company.manager.id = :managerId)")
    Page<Warehouse> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("managerId") Long managerId,
            Pageable pageable
    );

    @Query("SELECT w FROM Warehouse w " +
            "JOIN w.company c " +
            "JOIN c.manager m " +
            "WHERE m.id = :managerId")
    List<Warehouse> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT DISTINCT w FROM Warehouse w LEFT JOIN FETCH w.warehouseProducts wp LEFT JOIN FETCH wp.product")
    List<Warehouse> findAllWithProducts();
}
