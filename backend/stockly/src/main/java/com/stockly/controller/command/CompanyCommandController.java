package com.stockly.controller.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.model.Company;
import com.stockly.service.command.CompanyCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyCommandController {

    private final CompanyCommandService companyCommandService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Company createCompany(@RequestBody @Valid CompanyDTO companyDTO) {
        return companyCommandService.createCompany(companyDTO);
    }

    @PutMapping("/{id}")
    public Company updateCompany(@PathVariable Long id, @RequestBody @Valid CompanyDTO companyDTO) {
        return companyCommandService.updateCompany(id, companyDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCompany(@PathVariable Long id) {
        companyCommandService.deleteCompany(id);
    }

}