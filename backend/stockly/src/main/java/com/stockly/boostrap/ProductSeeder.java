package com.stockly.boostrap;

import com.stockly.dto.ExternalProductDTO;
import com.stockly.dto.ExternalProductReviewDTO;
import com.stockly.model.*;
import com.stockly.repository.*;
import com.stockly.response.ExternalProductResponse;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ProductSeeder implements ApplicationListener<ContextRefreshedEvent> {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final DimensionRepository dimensionRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductReviewRepository productReviewRepository;
    private final TagRepository tagRepository;
    private final RestTemplate restTemplate;

    public ProductSeeder(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            DimensionRepository dimensionRepository,
            ProductImageRepository productImageRepository,
            ProductReviewRepository productReviewRepository,
            TagRepository tagRepository,
            RestTemplate restTemplate
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.dimensionRepository = dimensionRepository;
        this.productImageRepository = productImageRepository;
        this.productReviewRepository = productReviewRepository;
        this.tagRepository = tagRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        this.loadProducts();
    }


    public void loadProducts() {
        String url = "https://dummyjson.com/products?limit=100";
        ExternalProductResponse response = restTemplate.getForObject(url, ExternalProductResponse.class);

        if (response == null || response.getProducts() == null) return;

        for (ExternalProductDTO dto : response.getProducts()) {
            if (productRepository.existsById(dto.getId())) {
                continue;
            }

            Category category = categoryRepository.findByName(dto.getCategory())
                    .orElseGet(() -> categoryRepository.save(new Category(dto.getCategory())));

            Dimension dimension = new Dimension();
            dimension.setWidth(dto.getDimensions().getWidth());
            dimension.setHeight(dto.getDimensions().getHeight());
            dimension.setDepth(dto.getDimensions().getDepth());

            Product product = new Product();
            product.setTitle(dto.getTitle());
            product.setDescription(dto.getDescription());
            product.setCategory(category);
            product.setPrice(BigDecimal.valueOf(dto.getPrice()));
            product.setDiscountPercentage(BigDecimal.valueOf(dto.getDiscountPercentage()));//qita
            product.setRating(BigDecimal.valueOf(dto.getRating()));
            product.setStock(dto.getStock()); //qita
            product.setSku(dto.getSku());
            product.setWeight(dto.getWeight());
            product.setWarrantyInformation(dto.getWarrantyInformation());
            product.setShippingInformation(dto.getShippingInformation());
            product.setAvailabilityStatus(dto.getAvailabilityStatus()); //status
            product.setReturnPolicy(dto.getReturnPolicy());
            product.setMinimumOrderQuantity(dto.getMinimumOrderQuantity()); //qita
            product.setBarcode(dto.getMeta().getBarcode());
            product.setQrCode(dto.getMeta().getQrCode());
            product.setCreatedAt(dto.getMeta().getCreatedAt());
            product.setUpdatedAt(dto.getMeta().getUpdatedAt());
            product.setThumbnailUrl(dto.getThumbnail());

            Set<Tag> tags = dto.getTags().stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                            .orElseGet(() -> tagRepository.save(new Tag(tagName))))
                    .collect(Collectors.toSet());
            product.setTags(tags);

            Product savedProduct = productRepository.save(product);

            dimension.setProduct(savedProduct);
            dimensionRepository.save(dimension);

            for (ExternalProductReviewDTO r : dto.getReviews()) {
                ProductReview review = new ProductReview();
                review.setProduct(savedProduct);
                review.setRating(r.getRating());
                review.setComment(r.getComment());
                review.setDate(r.getDate());
                review.setReviewerName(r.getReviewerName());
                review.setReviewerEmail(r.getReviewerEmail());
                productReviewRepository.save(review);
            }

            for (String img : dto.getImages()) {
                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(img);
                productImageRepository.save(image);
            }
        }
    }

}
