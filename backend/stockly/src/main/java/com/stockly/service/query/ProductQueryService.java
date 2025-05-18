package com.stockly.service.query;

import com.stockly.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

public interface ProductQueryService {
    List<ProductDTO> getAllProducts();
    Optional<ProductDTO> getProductById(Long id);
    List<ProductDTO> searchProducts(String searchTerm);
    Page<ProductDTO> getAllProductsWithPagination(PageRequest pageRequest);

    Long getProductCount();
}
