package com.stockly.service;
import com.stockly.model.ProductLogDocument;
import com.stockly.repository.ProductLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductLogService {
    private final ProductLogRepository productLogRepository;

    public void logProductAction(Long productId, String action, Object dto) {
        ProductLogDocument log = new ProductLogDocument();
        log.setProductId(productId);
        log.setAction(action);
        log.setTimestamp(Instant.now());
        log.setData(dto);
        productLogRepository.save(log);
    }


    // ProductLogService.java (add these methods)
    public List<ProductLogDocument> getLogsByProductId(Long productId) {
        return productLogRepository.findByProductId(productId);
    }

    public Page<ProductLogDocument> getLogsByProductId(Long productId, Pageable pageable) {
        return productLogRepository.findByProductId(productId, pageable);
    }

    public Page<ProductLogDocument> getLogsByAction(String action, Pageable pageable) {
        return productLogRepository.findByAction(action, pageable);
    }

    public Page<ProductLogDocument> getAllLogs(Pageable pageable) {
        return productLogRepository.findAll(pageable);
    }
}