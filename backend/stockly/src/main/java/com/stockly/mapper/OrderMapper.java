package com.stockly.mapper;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.OrderItemDTO;
import com.stockly.dto.ProductDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.model.*;
import com.stockly.model.enums.OrderStatus;
import com.stockly.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;
    private final ProductRepository productRepository;

    public OrderDTO toDto(Order order) {
        Objects.requireNonNull(order, "Order cannot be null");

        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveryDate(order.getDeliveryDate());
        dto.setStatus(order.getStatus().name());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setShipmentId(order.getShipmentId());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setDescription(order.getDescription());
        dto.setDestinationWarehouseName(order.getDestinationWarehouseName());
        dto.setSourceWarehouseName(order.getSourceWarehouseName());

        if (order.getBuyer() != null) {
            dto.setBuyerId(order.getBuyer().getId());
            dto.setBuyerName(order.getBuyer().getCompanyName());
        }

        if (order.getSupplier() != null) {
            dto.setSupplierId(order.getSupplier().getId());
            dto.setSupplierName(order.getSupplier().getCompanyName());
        }

        if(order.getSourceWarehouse() != null) {
            dto.setSourceWarehouseId(order.getSourceWarehouse().getId());
            dto.setSourceWarehouseName(order.getSourceWarehouse().getName());
        }

        if(order.getDestinationWarehouse() != null) {
            dto.setDestinationWarehouseId(order.getDestinationWarehouse().getId());
            dto.setDestinationWarehouseName(order.getDestinationWarehouse().getName());
        }

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemDTO> itemDTOs = order.getItems().stream()
                    .map(orderItemMapper::toDto)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }



        return dto;
    }

    public Order toEntity(OrderDTO dto) {
        Objects.requireNonNull(dto, "OrderDTO cannot be null");
        Order order = new Order();
        return updateEntityFromDto(dto, order);
    }

    public Order updateEntityFromDto(OrderDTO dto, Order order) {
        Objects.requireNonNull(dto, "OrderDTO cannot be null");
        Objects.requireNonNull(order, "Order cannot be null");

        // Basic fields
        order.setOrderDate(dto.getOrderDate());
        order.setDeliveryDate(dto.getDeliveryDate());
        order.setShipmentId(dto.getShipmentId());
        order.setUpdatedAt(dto.getUpdatedAt());
        order.setDescription(dto.getDescription());

        if (dto.getStatus() != null) {
            order.setStatus(OrderStatus.valueOf(dto.getStatus()));
        } else if (order.getStatus() == null) {
            order.setStatus(OrderStatus.CREATED);
        }

        order.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt() : new Date());

        // Handle relationships
        if (dto.getBuyerId() != null) {
            Company buyer = new Company();
            buyer.setId(dto.getBuyerId());
            order.setBuyer(buyer);
        }

        if (dto.getSupplierId() != null) {
            Company supplier = new Company();
            supplier.setId(dto.getSupplierId());
            order.setSupplier(supplier);
        }

        if (dto.getSourceWarehouseId() != null) {
            Warehouse warehouse = new Warehouse();
            warehouse.setId(dto.getSourceWarehouseId());
            order.setSourceWarehouse(warehouse);
        }

        if (dto.getDestinationWarehouseId() != null) {
            Warehouse warehouse = new Warehouse();
            warehouse.setId(dto.getDestinationWarehouseId());
            order.setDestinationWarehouse(warehouse);
        }

        // Handle order items if present in DTO
        if (dto.getItems() != null) {
            // Clear existing items if any
            order.getItems().clear();

            // Add new items from DTO
            dto.getItems().forEach(itemDto -> {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Product not found with id: " + itemDto.getProductId()));

                ProductDTO productDTO = ProductMapper.toDTO(product);

                OrderItem item = orderItemMapper.toEntity(itemDto, productDTO);
                item.setOrder(order); // Set bidirectional relationship
                order.getItems().add(item);
            });

            // Recalculate order total
            order.setTotalPrice(calculateOrderTotal(order));
        } else if (order.getTotalPrice() == null) {
            order.setTotalPrice(BigDecimal.ZERO);
        }

        return order;
    }

    public Order createNewOrderFromDto(OrderDTO dto) {
        Objects.requireNonNull(dto, "OrderDTO cannot be null");

        Order order = toEntity(dto);
        order.setId(null); // Ensure new entity

        if (order.getOrderDate() != null) {
            order.setOrderDate(dto.getOrderDate());
        }

        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.CREATED);
        }

        order.setUpdatedAt(new Date());

        // Initialize total price based on items or zero
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            order.setTotalPrice(calculateOrderTotal(order));
        } else {
            order.setTotalPrice(BigDecimal.ZERO);
        }
        order.setShipmentId(null);

        return order;
    }

    private BigDecimal calculateOrderTotal(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return order.getItems().stream()
                .map(OrderItem::getTotalPrice)
                .filter(Objects::nonNull) // Filter out null values
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}