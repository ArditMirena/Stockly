package com.stockly.service.impl.command;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.OrderItemDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderMapper;
import com.stockly.model.*;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.OrderCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OrderCommandServiceImpl implements OrderCommandService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CompanyRepository companyRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional
    public Order createOrder(OrderDTO dto) {
        // Validate required fields
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        Order order = orderMapper.createNewOrderFromDto(dto);

        // Set relationships properly
        if (dto.getBuyerId() != null) {
            Company buyer = companyRepository.findById(dto.getBuyerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with id: " + dto.getBuyerId()));
            buyer.setOrdersAsBuyer(null);
            buyer.setOrdersAsSupplier(null);
            order.setBuyer(buyer);
        }

        if (dto.getSupplierId() != null) {
            Company supplier = companyRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + dto.getSupplierId()));
            supplier.setOrdersAsBuyer(null);
            supplier.setOrdersAsSupplier(null);
            order.setSupplier(supplier);
        }

        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + dto.getWarehouseId()));
            order.setWarehouse(warehouse);
        }

        // Process order items
        processOrderItems(dto, order);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order updateOrder(Long id, OrderDTO orderDTO) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Process order items before mapping
        if (orderDTO.getItems() != null) {
            processOrderItems(orderDTO, existingOrder);
        }

        orderMapper.updateEntityFromDto(orderDTO, existingOrder);
        return orderRepository.save(existingOrder);
    }

    private void processOrderItems(OrderDTO dto, Order order) {
        // Clear existing items if any (for updates)
        order.getItems().clear();

        // Add new items from DTO
        for (OrderItemDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemDto.getProductId()));

            // Create and add order item
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.calculateTotalPrice();

            order.getItems().add(item);
        }

        // Recalculate order total
        order.setTotalPrice(calculateOrderTotal(order));
    }

    private BigDecimal calculateOrderTotal(Order order) {
        return order.getItems().stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderDTO statusUpdateDto = new OrderDTO();
        statusUpdateDto.setStatus(status);
        orderMapper.updateEntityFromDto(statusUpdateDto, order);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!"CANCELLED".equals(order.getStatus())) {
            OrderDTO cancelDto = new OrderDTO();
            cancelDto.setStatus("CANCELLED");
            orderMapper.updateEntityFromDto(cancelDto, order);
            orderRepository.save(order);
        }
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }
}