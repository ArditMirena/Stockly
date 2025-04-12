package com.stockly.controller.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.service.query.CompanyQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyQueryController {

    private final CompanyQueryService companyQueryService;

    @GetMapping("/{id}")
    public CompanyDTO getCompanyById(@PathVariable Long id) {
        return companyQueryService.getCompanyById(id);
    }

    @GetMapping
    public Page<CompanyDTO> getAllCompanies(Pageable pageable) {
        return companyQueryService.getAllCompanies(pageable);
    }

    @GetMapping("/type/{companyType}")
    public List<CompanyDTO> getCompaniesByType(@PathVariable String companyType) {
        return companyQueryService.getCompaniesByType(companyType);
    }

    @GetMapping("/exists/email/{email}")
    public boolean companyExistsByEmail(@PathVariable String email) {
        return companyQueryService.companyExistsByEmail(email);
    }
}