package com.stockly.controller.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.mapper.CompanyMapper;
import com.stockly.model.Company;
import com.stockly.service.command.CompanyCommandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyCommandController {

    private final CompanyCommandService companyCommandService;

    public CompanyCommandController(CompanyCommandService companyCommandService) {
        this.companyCommandService = companyCommandService;
    }

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(
            @RequestBody CompanyDTO companyDTO,
            @RequestParam(required = false) String businessType, // Additional Buyer-specific attribute
            @RequestParam(required = false) Long warehouseId     // Additional Supplier-specific attribute
    ) {
        Company company = CompanyMapper.toEntity(companyDTO);
        Company createdCompany = companyCommandService.createCompany(company, businessType, warehouseId);
        return new ResponseEntity<>(CompanyMapper.toDTO(createdCompany), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Long id, @RequestBody CompanyDTO companyDTO) {
        Company company = CompanyMapper.toEntity(companyDTO);
        Company updatedCompany = companyCommandService.updateCompany(id, company);
        return ResponseEntity.ok(CompanyMapper.toDTO(updatedCompany));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyCommandService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}