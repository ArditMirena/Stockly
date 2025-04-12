package com.stockly.service.query;

import com.stockly.dto.OrderDTO;
import com.stockly.model.Order;
import org.springframework.data.domain.Page;
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
}