package com.stockly.service.impl.query;

import com.stockly.model.InventoryLog;
import com.stockly.repository.InventoryLogRepository;
import com.stockly.service.query.InventoryLogQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryLogQueryServiceImpl implements InventoryLogQueryService {

    private final InventoryLogRepository inventoryLogRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Page<InventoryLog> getLogsByWarehouse(Long warehouseId, Pageable pageable) {
        return inventoryLogRepository.findByWarehouseId(warehouseId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByProduct(Long productId, Pageable pageable) {
        return inventoryLogRepository.findByProductId(productId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByWarehouseAndProduct(Long warehouseId, Long productId, Pageable pageable) {
        return inventoryLogRepository.findByWarehouseIdAndProductId(warehouseId, productId, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByTimeRange(Instant start, Instant end, Pageable pageable) {
        return inventoryLogRepository.findByTimestampBetween(start, end, pageable);
    }

    @Override
    public Page<InventoryLog> getLogsByActionType(String actionType, Pageable pageable) {
        return inventoryLogRepository.findByActionType(actionType, pageable);
    }

    @Override
    public List<InventoryLog> getRecentActivity(Long warehouseId, int limit) {
        return inventoryLogRepository.findByWarehouseIdOrderByTimestampDesc(warehouseId, PageRequest.of(0, limit));
    }

    @Override
    public InventoryLog getLastRestockForProduct(Long warehouseId, Long productId) {
        return inventoryLogRepository.findFirstByWarehouseIdAndProductIdAndActionTypeOrderByTimestampDesc(
                warehouseId, productId, "RESTOCK");
    }

    @Override
    public Page<InventoryLog> getInventoryLogsWithPagination(
            Pageable pageable,
            Long warehouseId,
            Long productId,
            String actionType,
            String source,
            Long userId,
            Instant startDate,
            Instant endDate,
            String searchTerm) {

        Query query = new Query().with(pageable);

        List<Criteria> criteriaList = new ArrayList<>();

        if (warehouseId != null) {
            criteriaList.add(Criteria.where("warehouseId").is(warehouseId));
        }

        if (productId != null) {
            criteriaList.add(Criteria.where("productId").is(productId));
        }

        if (actionType != null && !actionType.isEmpty()) {
            criteriaList.add(Criteria.where("actionType").is(actionType));
        }

        if (source != null && !source.isEmpty()) {
            criteriaList.add(Criteria.where("source").is(source));
        }

        if (userId != null) {
            criteriaList.add(Criteria.where("userId").is(userId));
        }

        if (startDate != null && endDate != null) {
            criteriaList.add(Criteria.where("timestamp").gte(startDate).lte(endDate));
        } else if (startDate != null) {
            criteriaList.add(Criteria.where("timestamp").gte(startDate));
        } else if (endDate != null) {
            criteriaList.add(Criteria.where("timestamp").lte(endDate));
        }

        if (searchTerm != null && !searchTerm.isEmpty()) {
            String regex = ".*" + searchTerm + ".*";
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("productSku").regex(regex, "i"),
                    Criteria.where("productTitle").regex(regex, "i"),
                    Criteria.where("warehouseName").regex(regex, "i"),
                    Criteria.where("userName").regex(regex, "i"),
                    Criteria.where("notes").regex(regex, "i")
            ));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return PageableExecutionUtils.getPage(
                mongoTemplate.find(query, InventoryLog.class),
                pageable,
                () -> mongoTemplate.count(query.skip(0).limit(0), InventoryLog.class)
        );
    }
}