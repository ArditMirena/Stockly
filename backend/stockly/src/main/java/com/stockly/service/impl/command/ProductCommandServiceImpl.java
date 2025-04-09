    package com.stockly.service.impl.command;

    import com.stockly.dto.ProductDTO;
    import com.stockly.mapper.ProductMapper;
    import com.stockly.model.Product;
    import com.stockly.repository.ProductRepository;
    import com.stockly.service.command.ProductCommandService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    @Service
    @RequiredArgsConstructor
    @Transactional
    public class ProductCommandServiceImpl implements ProductCommandService {

        private final ProductRepository productRepository;

        @Override
        public ProductDTO createProduct(ProductDTO productDTO) {
            Product product = ProductMapper.toEntity(productDTO);
            Product saved = productRepository.save(product);
            return ProductMapper.toDTO(saved);
        }

        @Override
        public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
            Product existing = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

            Product updated = ProductMapper.toEntity(productDTO);
            updated.setId(existing.getId()); // Preserve ID
            Product saved = productRepository.save(updated);

            return ProductMapper.toDTO(saved);
        }

        @Override
        public void deleteProduct(Long id) {
            if (!productRepository.existsById(id)) {
                throw new RuntimeException("Product not found with id: " + id);
            }
            productRepository.deleteById(id);
        }
    }
