package com.stockly.service.impl.query;

import com.stockly.dto.OrderDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderMapper;
import com.stockly.model.Order;
import com.stockly.model.enums.OrderStatus;
import com.stockly.repository.OrderRepository;
import com.stockly.service.query.OrderQueryService;
import com.stockly.specification.OrderSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.ast.Or;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    public Page<OrderDTO> getAllOrdersWithPagination(PageRequest pageRequest) {
        Page<Order> orders = orderRepository.findAll(pageRequest);

        List<OrderDTO> orderDTOS = orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(orderDTOS, pageRequest, orders.getTotalElements());
    }

    @Override
    public List<OrderDTO> searchOrders(String searchTerm) {
        final Specification<Order> specification = OrderSpecification.unifiedSearch(searchTerm);
        final List<Order> orders = orderRepository.findAll(specification);
        return orders.stream().map(orderMapper::toDto).collect(Collectors.toList());
    }


}