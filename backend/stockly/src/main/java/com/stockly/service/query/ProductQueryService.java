package com.stockly.service.query;

import com.stockly.dto.ProductDTO;

import java.util.List;
import java.util.Optional;

public interface ProductQueryService {
    List<ProductDTO> getAllProducts();
    Optional<ProductDTO> getProductById(Long id);
}
