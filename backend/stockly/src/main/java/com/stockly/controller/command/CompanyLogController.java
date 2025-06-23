package com.stockly.controller.command;

// CompanyLogController.java

import com.stockly.model.CompanyLogDocument;
import com.stockly.service.CompanyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company-logs")
@RequiredArgsConstructor
public class CompanyLogController {
    private final CompanyLogService companyLogService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CompanyLogDocument>> getLogsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyLogService.getLogsByCompanyId(companyId));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<Page<CompanyLogDocument>> getLogsByAction(
            @PathVariable String action,
            Pageable pageable
    ) {
        return ResponseEntity.ok(companyLogService.getLogsByAction(action, pageable));
    }

    @GetMapping
    public ResponseEntity<Page<CompanyLogDocument>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(companyLogService.getAllLogs(pageable));
    }
}