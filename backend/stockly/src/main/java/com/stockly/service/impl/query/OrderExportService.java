package com.stockly.service.impl.query;

import com.stockly.dto.OrderExportDTO;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.WarehouseProductRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderExportService {
    private final OrderRepository orderRepository;
    private final StockCalculationService stockCalculationService;

    public List<OrderExportDTO> exportOrders(Instant startDate) {
        return orderRepository.findOrdersForExport(startDate).stream()
                .map(proj -> new OrderExportDTO(
                        proj.getProductId(),
                        proj.getWarehouseId(),
                        proj.getOrderDate(),
                        proj.getQuantity(),
                        proj.getCurrentStock()
                ))
                .collect(Collectors.toList());
    }
}
