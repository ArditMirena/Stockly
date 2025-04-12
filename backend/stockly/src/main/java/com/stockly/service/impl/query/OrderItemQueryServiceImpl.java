package com.stockly.service.impl.query;

import com.stockly.dto.OrderItemDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderItemMapper;
import com.stockly.repository.OrderItemRepository;
import com.stockly.service.query.OrderItemQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemQueryServiceImpl implements OrderItemQueryService {

    private final OrderItemRepository repository;
    private final OrderItemMapper mapper;

    @Override
    public OrderItemDTO getOrderItemById(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + id));
    }

    @Override
    public List<OrderItemDTO> getOrderItemsByOrder(Long orderId) {
        return repository.findByOrderId(orderId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public List<OrderItemDTO> getOrderItemsByProduct(Long productId) {
        return repository.findByProductId(productId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public Page<OrderItemDTO> getAllOrderItems(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toDto);
    }

    @Override
    public Integer getProductTotalOrderedQuantity(Long productId) {
        Integer quantity = repository.sumQuantityByProductId(productId);
        return quantity != null ? quantity : 0;
    }
}