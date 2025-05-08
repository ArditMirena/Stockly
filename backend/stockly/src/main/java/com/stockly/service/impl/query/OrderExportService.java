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

//    @org.springframework.transaction.annotation.Transactional(readOnly = true)
//    public List<OrderExportDTO> exportOrders(Instant startDate) {
//        // Get all orders with placeholder stock values
//        List<OrderExportDTO> exports = orderRepository.findOrdersForExport(startDate);
//
//        // Pre-calculate stock timelines for efficiency
//        Map<Pair<Long, Long>, TreeMap<Instant, Integer>> stockTimelines =
//                stockCalculationService.getStockTimelines(startDate);
//
//        // Create new DTOs with correct stock values
//        return exports.stream()
//                .map(dto -> {
//                    Pair<Long, Long> key = Pair.of(dto.productId(), dto.warehouseId());
//                    Integer stockBeforeOrder = Optional.ofNullable(stockTimelines.get(key))
//                            .map(timeline -> {
//                                Map.Entry<Instant, Integer> entry = timeline.floorEntry(dto.orderDate());
//                                return entry != null ? entry.getValue() : 0;
//                            })
//                            .orElse(0);
//
//                    return new OrderExportDTO(
//                            dto.productId(),
//                            dto.warehouseId(),
//                            dto.orderDate(),
//                            dto.quantity(),
//                            stockBeforeOrder
//                    );
//                })
//                .collect(Collectors.toList());
//    }
}
