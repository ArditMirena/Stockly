package com.stockly.controller.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.service.query.CompanyQueryService;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyQueryController {

    private final CompanyQueryService companyQueryService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyQueryService.getCompanyById(id));
    }


    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyQueryService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/type/{companyType}")
    public ResponseEntity<List<CompanyDTO>> getCompaniesByType(@PathVariable String companyType) {
        List<CompanyDTO> companies = companyQueryService.getCompaniesByType(companyType);
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/exists/email/{email}")
    public boolean companyExistsByEmail(@PathVariable String email) {
        return companyQueryService.companyExistsByEmail(email);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CompanyDTO>> searchCompany(
            @RequestParam(required = false) String searchTerm
    ) {
        return ResponseEntity.ok(companyQueryService.searchCompanies(searchTerm));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<CompanyDTO>> getAllCompaniesWithPagination(
            @RequestParam(value = "offset", required = false) Integer offset,
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "companyType", required = false) String companyType
    ) {
        if(null == offset) offset = 0;
        if(null == pageSize) pageSize = 10;
        if(StringUtils.isEmpty(sortBy)) sortBy = "id";

        if(StringUtils.isNotEmpty(companyType)) {
            return ResponseEntity.ok(companyQueryService.getCompaniesByTypeWithPagination(
                    companyType,
                    PageRequest.of(offset, pageSize, Sort.by(sortBy))
            ));
        } else {
            return ResponseEntity.ok(companyQueryService.getAllCompaniesWithPagination(
                    PageRequest.of(offset, pageSize, Sort.by(sortBy))
            ));
        }
    }
}