package com.stockly.controller.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.mapper.CompanyMapper;
import com.stockly.service.query.CompanyQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyQueryController {

    private final CompanyQueryService companyQueryService;

    public CompanyQueryController(CompanyQueryService companyQueryService) {
        this.companyQueryService = companyQueryService;
    }

    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyQueryService.getAllCompanies()
                .stream()
                .map(CompanyMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return companyQueryService.getCompanyById(id)
                .map(CompanyMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CompanyDTO> getCompanyByEmail(@PathVariable String email) {
        return companyQueryService.getCompanyByEmail(email)
                .map(CompanyMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{companyType}")
    public ResponseEntity<List<CompanyDTO>> getCompaniesByType(@PathVariable String companyType) {
        List<CompanyDTO> companies = companyQueryService.getCompaniesByType(companyType)
                .stream()
                .map(CompanyMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(companies);
    }
}