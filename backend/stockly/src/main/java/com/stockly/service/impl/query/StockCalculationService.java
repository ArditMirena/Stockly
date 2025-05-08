package com.stockly.service.impl.query;

import com.stockly.dto.WarehouseStockDTO;
import com.stockly.repository.WarehouseProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.util.Pair;
import com.stockly.projection.StockChangeProjection;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockCalculationService {
    private final WarehouseProductRepository warehouseProductRepository;

    // Method without startDate parameter - calculates complete history
    public List<WarehouseStockDTO> calculateStockHistory() {
        return warehouseProductRepository.findAllStockChanges().stream()
                .collect(Collectors.groupingBy(
                        change -> Pair.of(change.getProductId(), change.getWarehouseId())
                ))
                .entrySet().stream()
                .flatMap(entry -> {
                    final Pair<Long, Long> key = entry.getKey();
                    final List<StockChangeProjection> changes = entry.getValue();

                    // Get initial stock from first warehouse entry
                    int initialStock = warehouseProductRepository.findInitialStock(
                            key.getFirst(),
                            key.getSecond()
                    );

                    final AtomicInteger runningStock = new AtomicInteger(initialStock);

                    return changes.stream()
                            .sorted(Comparator.comparing(StockChangeProjection::getTimestamp))
                            .map(change -> {
                                int newStock = runningStock.addAndGet(change.getQuantityChange());
                                return new WarehouseStockDTO(
                                        key.getFirst(),
                                        key.getSecond(),
                                        change.getTimestamp(),
                                        change.getQuantityChange(),
                                        newStock,
                                        change.getChangeType()
                                );
                            });
                })
                .collect(Collectors.toList());
    }

    // Method with startDate parameter - calculates history from specific date
    public List<WarehouseStockDTO> calculateStockHistory(Instant startDate) {
        return warehouseProductRepository.findStockChanges(startDate).stream()
                .collect(Collectors.groupingBy(
                        change -> Pair.of(change.getProductId(), change.getWarehouseId())
                ))
                .entrySet().stream()
                .flatMap(entry -> {
                    final Pair<Long, Long> key = entry.getKey();
                    final List<StockChangeProjection> changes = entry.getValue();

                    // Get stock at the specific start date
                    int initialStock = warehouseProductRepository.findStockAtTime(
                            key.getFirst(),
                            key.getSecond(),
                            startDate
                    );

                    final AtomicInteger runningStock = new AtomicInteger(initialStock);

                    return changes.stream()
                            .sorted(Comparator.comparing(StockChangeProjection::getTimestamp))
                            .map(change -> {
                                int newStock = runningStock.addAndGet(change.getQuantityChange());
                                return new WarehouseStockDTO(
                                        key.getFirst(),
                                        key.getSecond(),
                                        change.getTimestamp(),
                                        change.getQuantityChange(),
                                        newStock,
                                        change.getChangeType()
                                );
                            });
                })
                .collect(Collectors.toList());
    }

    public Map<Pair<Long, Long>, TreeMap<Instant, Integer>> getStockTimelines(Instant startDate) {
        List<WarehouseStockDTO> stockHistory = calculateStockHistory(startDate);

        Map<Pair<Long, Long>, TreeMap<Instant, Integer>> timelines = new HashMap<>();

        for (WarehouseStockDTO dto : stockHistory) {
            Pair<Long, Long> key = Pair.of(dto.productId(), dto.warehouseId());
            timelines.computeIfAbsent(key, k -> new TreeMap<>())
                    .put(dto.timestamp(), dto.currentStock());
        }

        return timelines;
    }
}