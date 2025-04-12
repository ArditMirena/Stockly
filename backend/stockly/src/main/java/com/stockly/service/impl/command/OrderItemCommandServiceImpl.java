package com.stockly.service.impl.command;

import com.stockly.dto.OrderItemDTO;
import com.stockly.dto.ProductDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderItemMapper;
import com.stockly.mapper.ProductMapper;
import com.stockly.model.*;
import com.stockly.repository.*;
import com.stockly.service.command.OrderItemCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderItemCommandServiceImpl implements OrderItemCommandService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemMapper mapper;

    @Override
    @Transactional
    public OrderItem createOrderItem(Long orderId, OrderItemDTO dto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductDTO productDTO = ProductMapper.toDTO(product);

        OrderItem item = mapper.toEntity(dto, productDTO);
        item.setOrder(order);
        item.setProduct(product);
        item.calculateTotalPrice();

        return orderItemRepository.save(item);
    }

    @Override
    @Transactional
    public OrderItem updateOrderItem(Long id, OrderItemDTO dto) {
        OrderItem existing = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        // Get fresh product data
        Product product = productRepository.findById(existing.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        mapper.updateEntity(dto, existing, product);
        return orderItemRepository.save(existing);
    }

    @Override
    @Transactional
    public void updateOrderItemQuantity(Long id, Integer quantity) {
        OrderItem item = orderItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + id));

        item.setQuantity(quantity);
        item.calculateTotalPrice();
        orderItemRepository.save(item);
    }

    @Override
    @Transactional
    public void deleteOrderItem(Long id) {
        if (!orderItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order item not found with id: " + id);
        }
        orderItemRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllByOrderId(Long orderId) {
        orderItemRepository.deleteByOrderId(orderId);
    }
}