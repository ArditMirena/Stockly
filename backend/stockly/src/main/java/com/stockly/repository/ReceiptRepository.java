package com.stockly.repository;
import com.stockly.model.Receipt;
import com.stockly.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long>, JpaSpecificationExecutor<Receipt> {
    Receipt findByOrderId(Long orderId);

    @Modifying
    @Query("UPDATE Receipt o SET o.sourceWarehouse = null WHERE o.sourceWarehouse.id = :id")
    void nullifySourceReferences(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Receipt o SET o.destinationWarehouse = null WHERE o.destinationWarehouse.id = :id")
    void nullifyDestinationReferences(@Param("id") Long id);

    boolean existsBySourceWarehouseId(Long warehouseId);
    boolean existsByDestinationWarehouseId(Long warehouseId);

}
