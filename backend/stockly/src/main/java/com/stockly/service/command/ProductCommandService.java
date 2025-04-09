package com.stockly.service.command;

import com.stockly.dto.ProductDTO;

public interface ProductCommandService {
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    void deleteProduct(Long id);
}
