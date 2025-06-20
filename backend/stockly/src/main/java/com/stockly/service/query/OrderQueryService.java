package com.stockly.service.query;

import com.stockly.dto.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface OrderQueryService {
    OrderDTO getOrderById(Long id);
    List<OrderDTO> getAllOrders();
    Page<OrderDTO> getAllOrders(Pageable pageable);
    List<OrderDTO> getOrdersByBuyer(Long buyerId);
    List<OrderDTO> getOrdersBySupplier(Long supplierId);
    List<OrderDTO> getOrdersByStatus(String status);
    List<OrderDTO> getOrdersBetweenDates(Date startDate, Date endDate);
    BigDecimal getTotalRevenueBySupplier(Long supplierId);
    Long countOrdersByStatus(String status);
    List<OrderDTO> getOrdersByManagerId(Long managerId);

    Long getOrdersCount();

    Page<OrderDTO> getAllOrdersWithPagination(
            Pageable pageable,
            Long buyerManagerId,
            Long supplierManagerId,
            Long managerId,
            Long buyerCompanyId,
            Long supplierCompanyId,
            Long sourceWarehouseId,
            Long destinationWarehouseId,
            String searchTerm
    );























}