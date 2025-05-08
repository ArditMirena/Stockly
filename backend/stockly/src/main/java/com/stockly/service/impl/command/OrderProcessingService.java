package com.stockly.service.impl.command;

import com.stockly.dto.OrderDTO;
import com.stockly.dto.OrderItemDTO;
import com.stockly.dto.request.OrderRequest;
import com.stockly.dto.request.OrderItemRequest;
import com.stockly.exception.BusinessException;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.OrderMapper;
import com.stockly.model.Order;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.OrderCommandService;
import com.stockly.service.command.WarehouseCommandService;
import com.stockly.service.command.WarehouseProductCommandService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderProcessingService {
    private final OrderCommandService orderCommandService;
    private final WarehouseCommandService warehouseCommandService;
    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final WarehouseProductRepository warehouseProductRepository;
    private final OrderMapper orderMapper;

    public OrderDTO processOrder(OrderRequest request) {
        // 1. Validate warehouse
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        // 2. Check product availability in warehouse
        checkProductAvailability(warehouse, request.getItems());

        // 3. Create order
        OrderDTO orderDTO = createOrderDTO(request, warehouse);
        Order order = orderCommandService.createOrder(orderDTO);

        // 4. Update warehouse inventory
        updateWarehouseInventory(warehouse, request.getItems());

        return orderMapper.toDto(order);
    }

    private void checkProductAvailability(Warehouse warehouse, List<OrderItemRequest> items) {
        for (OrderItemRequest item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            WarehouseProduct warehouseProduct = warehouseProductRepository
                    .findByWarehouseAndProduct(warehouse, product)
                    .orElseThrow(() -> new BusinessException(
                            "Product " + product.getTitle() + " not available in warehouse " + warehouse.getName()));

            if (warehouseProduct.getQuantity() < item.getQuantity()) {
                throw new BusinessException("Insufficient stock for product: " + product.getTitle() +
                        ". Available: " + warehouseProduct.getQuantity() +
                        ", Requested: " + item.getQuantity());
            }
        }
    }

    private OrderDTO createOrderDTO(OrderRequest request, Warehouse warehouse) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setBuyerId(request.getBuyerId());
        orderDTO.setSupplierId(warehouse.getCompany().getId());
        orderDTO.setWarehouseId(warehouse.getId());
        orderDTO.setStatus("PROCESSING");

        List<OrderItemDTO> itemDTOs = request.getItems().stream()
                .map(item -> {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setProductId(product.getId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setUnitPrice(product.getPrice());
                    itemDTO.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    return itemDTO;
                })
                .collect(Collectors.toList());

        orderDTO.setItems(itemDTOs);
        return orderDTO;
    }

    private void updateWarehouseInventory(Warehouse warehouse, List<OrderItemRequest> items) {
        for (OrderItemRequest item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            warehouseCommandService.assignProductToWarehouse(
                    product.getId(),
                    -item.getQuantity(),
                    warehouse.getId()
            );
        }
    }
}
