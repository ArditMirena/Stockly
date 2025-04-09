package com.stockly.mapper;

import com.stockly.dto.*;
import com.stockly.model.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductDTO toDTO(Product product) {
        if (product == null) return null;

        return ProductDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPercentage(product.getDiscountPercentage())
                .rating(product.getRating())
                .stock(product.getStock())
                .sku(product.getSku())
                .weight(product.getWeight())
                .warrantyInformation(product.getWarrantyInformation())
                .shippingInformation(product.getShippingInformation())
                .availabilityStatus(product.getAvailabilityStatus())
                .returnPolicy(product.getReturnPolicy())
                .minimumOrderQuantity(product.getMinimumOrderQuantity())
                .barcode(product.getBarcode())
                .qrCode(product.getQrCode())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .thumbnailUrl(product.getThumbnailUrl())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .dimensions(toDimensionDTO(product.getDimensions()))
                .reviews(product.getReviews() != null ? product.getReviews().stream().map(ProductMapper::toReviewDTO).collect(Collectors.toList()) : null)
                .tags(product.getTags() != null ? product.getTags().stream().map(ProductMapper::toTagDTO).collect(Collectors.toSet()) : null)
                .images(product.getImages() != null ? product.getImages().stream().map(ProductMapper::toImageDTO).collect(Collectors.toList()) : null)
                .build();
    }

    public static Product toEntity(ProductDTO dto) {
        if (dto == null) return null;

        Product product = new Product();
        product.setId(dto.getId());
        product.setTitle(dto.getTitle());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPercentage(dto.getDiscountPercentage());
        product.setRating(dto.getRating());
        product.setStock(dto.getStock());
        product.setSku(dto.getSku());
        product.setWeight(dto.getWeight());
        product.setWarrantyInformation(dto.getWarrantyInformation());
        product.setShippingInformation(dto.getShippingInformation());
        product.setAvailabilityStatus(dto.getAvailabilityStatus());
        product.setReturnPolicy(dto.getReturnPolicy());
        product.setMinimumOrderQuantity(dto.getMinimumOrderQuantity());
        product.setBarcode(dto.getBarcode());
        product.setQrCode(dto.getQrCode());
        product.setCreatedAt(dto.getCreatedAt());
        product.setUpdatedAt(dto.getUpdatedAt());
        product.setThumbnailUrl(dto.getThumbnailUrl());

        if (dto.getCategoryId() != null) {
            Category category = new Category();
            category.setId(dto.getCategoryId());
            product.setCategory(category);
        }

        if (dto.getDimensions() != null) {
            Dimension dimension = new Dimension();
            dimension.setWidth(dto.getDimensions().getWidth());
            dimension.setHeight(dto.getDimensions().getHeight());
            dimension.setDepth(dto.getDimensions().getDepth());
            dimension.setProduct(product); // Set reverse reference
            product.setDimensions(dimension);
        }

        if (dto.getTags() != null) {
            Set<Tag> tags = dto.getTags().stream()
                    .map(tagDTO -> {
                        Tag tag = new Tag();
                        tag.setId(tagDTO.getId());
                        tag.setName(tagDTO.getName());
                        return tag;
                    }).collect(Collectors.toSet());
            product.setTags(tags);
        }

        if (dto.getImages() != null) {
            List<ProductImage> images = dto.getImages().stream()
                    .map(imageDTO -> {
                        ProductImage image = new ProductImage();
                        image.setImageUrl(imageDTO.getImageUrl());
                        image.setProduct(product); // reverse mapping
                        return image;
                    }).collect(Collectors.toList());
            product.setImages(images);
        }

        if (dto.getReviews() != null) {
            List<ProductReview> reviews = dto.getReviews().stream()
                    .map(reviewDTO -> {
                        ProductReview review = new ProductReview();
                        review.setRating(reviewDTO.getRating());
                        review.setComment(reviewDTO.getComment());
                        review.setDate(reviewDTO.getDate());
                        review.setReviewerName(reviewDTO.getReviewerName());
                        review.setReviewerEmail(reviewDTO.getReviewerEmail());
                        review.setProduct(product); // reverse mapping
                        return review;
                    }).collect(Collectors.toList());
            product.setReviews(reviews);
        }

        return product;
    }

    public static DimensionDTO toDimensionDTO(Dimension dimension) {
        if (dimension == null) return null;
        return DimensionDTO.builder()
                .width(dimension.getWidth())
                .height(dimension.getHeight())
                .depth(dimension.getDepth())
                .build();
    }

    public static ProductReviewDTO toReviewDTO(ProductReview review) {
        if (review == null) return null;
        return ProductReviewDTO.builder()
                .rating(review.getRating())
                .comment(review.getComment())
                .date(review.getDate())
                .reviewerName(review.getReviewerName())
                .reviewerEmail(review.getReviewerEmail())
                .build();
    }

    public static TagDTO toTagDTO(Tag tag) {
        if (tag == null) return null;
        return TagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }

    public static ProductImageDTO toImageDTO(ProductImage image) {
        if (image == null) return null;
        return ProductImageDTO.builder()
                .imageUrl(image.getImageUrl())
                .build();
    }
}
