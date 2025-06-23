package com.stockly.service;
// WarehouseLogService.java


import com.stockly.model.WarehouseLogDocument;
import com.stockly.repository.WarehouseLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseLogService {
    private final WarehouseLogRepository warehouseLogRepository;

    public void logWarehouseAction(Long warehouseId, String action, Object dto) {
        WarehouseLogDocument log = new WarehouseLogDocument();
        log.setWarehouseId(warehouseId);
        log.setAction(action);
        log.setTimestamp(Instant.now());
        log.setData(dto);
        warehouseLogRepository.save(log);
    }


    // Add to WarehouseLogService.java
    public List<WarehouseLogDocument> getLogsByWarehouseId(Long warehouseId) {
        return warehouseLogRepository.findByWarehouseId(warehouseId);
    }

    public Page<WarehouseLogDocument> getLogsByWarehouseId(Long warehouseId, Pageable pageable) {
        return warehouseLogRepository.findByWarehouseId(warehouseId, pageable);
    }

    public Page<WarehouseLogDocument> getLogsByAction(String action, Pageable pageable) {
        return warehouseLogRepository.findByAction(action, pageable);
    }

    public Page<WarehouseLogDocument> getAllLogs(Pageable pageable) {
        return warehouseLogRepository.findAll(pageable);
    }
}