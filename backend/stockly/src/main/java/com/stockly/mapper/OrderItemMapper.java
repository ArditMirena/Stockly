package com.stockly.mapper;

import com.stockly.dto.OrderItemDTO;
import com.stockly.dto.ProductDTO;
import com.stockly.model.OrderItem;
import com.stockly.model.Product;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItem toEntity(OrderItemDTO dto, ProductDTO product) {
        OrderItem orderItem = new OrderItem();
        orderItem.setQuantity(dto.getQuantity());
        orderItem.setUnitPrice(product.getPrice()); // Get price from Product
        return orderItem;
    }

    public OrderItemDTO toDto(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setQuantity(orderItem.getQuantity());

        // Read-only price fields
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());

        // Enrich with product details
        if (orderItem.getProduct() != null) {
            dto.setProductTitle(orderItem.getProduct().getTitle());
            dto.setProductSku(orderItem.getProduct().getSku());
            dto.setProductThumbnail(orderItem.getProduct().getThumbnailUrl());
        }

        return dto;
    }

    public void updateEntity(OrderItemDTO dto, OrderItem entity, Product product) {
        if (dto.getQuantity() != null) {
            entity.setQuantity(dto.getQuantity());
        }
        // Always get price from product, never from DTO
        entity.setUnitPrice(product.getPrice());
        entity.calculateTotalPrice();
    }
}