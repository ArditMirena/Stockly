package com.stockly.controller.query;

import com.stockly.dto.ProductDTO;
import com.stockly.dto.UserDTO;
import com.stockly.service.query.ProductQueryService;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductQueryController {

    private final ProductQueryService productQueryService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productQueryService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.of(productQueryService.getProductById(id));
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ProductDTO>> getAllProductsWithPagination(
            @RequestParam(value = "offset", required = false) Integer offset,
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "sortBy", required = false) String sortBy
    ) {
        if(null == offset) offset = 0;
        if(null == pageSize) pageSize = 10;
        if(StringUtils.isEmpty(sortBy)) sortBy = "id";
        return ResponseEntity.ok(productQueryService.getAllProductsWithPagination(PageRequest.of(offset, pageSize, Sort.by(sortBy))));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(
            @RequestParam(required = false) String searchTerm
    ) {
        return ResponseEntity.ok(productQueryService.searchProducts(searchTerm));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getProductCount() {
        return ResponseEntity.ok(productQueryService.getProductCount());
    }
}
