package com.stockly.specification;

import com.stockly.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {
    public static Specification<Product> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    likePattern
            );

            Predicate availabilityPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("availabilityStatus")),
                    likePattern
            );

            Predicate categoryPredicate = criteriaBuilder.like(
                    criteriaBuilder.upper(root.join("category").get("name").as(String.class)),
                    likePattern(searchTerm.toUpperCase())
            );

            return criteriaBuilder.or(titlePredicate, availabilityPredicate, categoryPredicate);
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}
