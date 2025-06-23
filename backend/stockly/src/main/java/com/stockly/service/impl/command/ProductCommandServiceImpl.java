package com.stockly.service.impl.command;

import com.stockly.dto.ProductDTO;
import com.stockly.mapper.ProductMapper;
import com.stockly.model.Product;
import com.stockly.repository.ProductRepository;
import com.stockly.service.ProductLogService;
import com.stockly.service.command.ProductCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCommandServiceImpl implements ProductCommandService {

    private final ProductRepository productRepository;
    private final ProductLogService productLogService;

    @Override
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = ProductMapper.toEntity(productDTO);
        product.setCreatedAt(Instant.now());
        product.setUpdatedAt(Instant.now());
        Product saved = productRepository.save(product);

        // Log creation
        productLogService.logProductAction(saved.getId(), "CREATE", productDTO);
        return ProductMapper.toDTO(saved);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update entity from DTO
        Product updated = ProductMapper.toEntity(productDTO);
        updated.setId(existing.getId()); // Preserve ID
        updated.setCreatedAt(existing.getCreatedAt()); // Preserve creation time
        updated.setUpdatedAt(Instant.now()); // Set new update time

        Product saved = productRepository.save(updated);
        ProductDTO updatedDTO = ProductMapper.toDTO(saved); // Create DTO for logging

        // Log update
        productLogService.logProductAction(id, "UPDATE", updatedDTO);
        return updatedDTO;
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id) // Get product first
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        ProductDTO dto = ProductMapper.toDTO(product); // Get DTO before deletion
        productRepository.deleteById(id);

        // Log deletion
        productLogService.logProductAction(id, "DELETE", dto);
    }
}