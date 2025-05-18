package com.stockly.service.impl.query;

import com.stockly.dto.OrderDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderMapper;
import com.stockly.model.Order;
import com.stockly.model.enums.OrderStatus;
import com.stockly.repository.OrderRepository;
import com.stockly.service.query.OrderQueryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderQueryServiceImpl implements OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDto(order);
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toDto);
    }

    @Override
    public List<OrderDTO> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersBySupplier(Long supplierId) {
        return orderRepository.findBySupplierId(supplierId)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersBetweenDates(Date startDate, Date endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal getTotalRevenueBySupplier(Long supplierId) {
        List<Order> orders = orderRepository.findBySupplierId(supplierId);
        return orders.stream()
                .map(Order::getTotalPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public Long countOrdersByStatus(String status) {
        return orderRepository.countByStatus(status);
    }





    @Override
    public Page<OrderDTO> searchOrders(
            Long buyerId,
            Long supplierId,
            String status,
            Date startDate,
            Date endDate,
            Pageable pageable
    ) {
        OrderStatus orderStatus = null;
        if (status != null) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid order status: " + status);
            }
        }

        return orderRepository.searchOrders(
                buyerId,
                supplierId,
                orderStatus,
                startDate,
                endDate,
                pageable
        ).map(orderMapper::toDto);
    }

    @Override
    public Long getOrdersCount(){
        return orderRepository.count();
    }
}