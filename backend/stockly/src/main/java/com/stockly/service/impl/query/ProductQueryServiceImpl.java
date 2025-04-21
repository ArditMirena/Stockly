package com.stockly.service.impl.query;

import com.stockly.dto.ProductDTO;
import com.stockly.dto.UserDTO;
import com.stockly.mapper.ProductMapper;
import com.stockly.model.Product;
import com.stockly.model.User;
import com.stockly.repository.ProductRepository;
import com.stockly.service.query.ProductQueryService;
import com.stockly.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductQueryServiceImpl implements ProductQueryService {
    private final ProductRepository productRepository;

    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProductDTO> getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductMapper::toDTO);
    }

    @Override
    public Page<ProductDTO> getAllProductsWithPagination(PageRequest pageRequest) {
        Page<Product> products = productRepository.findAll(pageRequest);

        List<ProductDTO> productDTOS = products.stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(productDTOS, pageRequest, products.getTotalElements());
    }

    @Override
    public List<ProductDTO> searchProducts(String searchTerm) {
        final Specification<Product> specification = ProductSpecification.unifiedSearch(searchTerm);
        final List<Product> products = productRepository.findAll(specification);
        return products.stream().map(ProductMapper::toDTO).collect(Collectors.toList());
    }
}
