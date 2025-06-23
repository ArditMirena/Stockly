package com.stockly.service;

// CompanyLogService.jav

import com.stockly.model.CompanyLogDocument;
import com.stockly.repository.CompanyLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CompanyLogService {
    private final CompanyLogRepository companyLogRepository;

    public void logCompanyAction(Long companyId, String action, Object dto) {
        CompanyLogDocument log = new CompanyLogDocument();
        log.setCompanyId(companyId);
        log.setAction(action);
        log.setTimestamp(Instant.now());
        log.setData(dto);
        companyLogRepository.save(log);
    }

    // CompanyLogService.java (add these methods)
    public Page<CompanyLogDocument> getLogsByCompanyId(Long companyId, Pageable pageable) {
        return companyLogRepository.findByCompanyId(companyId, pageable);
    }

    public Page<CompanyLogDocument> getLogsByAction(String action, Pageable pageable) {
        return companyLogRepository.findByAction(action, pageable);
    }

    public Page<CompanyLogDocument> getAllLogs(Pageable pageable) {
        return companyLogRepository.findAll(pageable);
    }
    public List<CompanyLogDocument> getLogsByCompanyId(Long companyId) {
        return companyLogRepository.findByCompanyId(companyId);
    }


















}