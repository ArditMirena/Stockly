package com.stockly.specification;

import com.stockly.model.Country;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class CountrySpecification {
    public static Specification<Country> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if(StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate  countryNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), likePattern
            );

            return criteriaBuilder.or(countryNamePredicate);
        };
    }
    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}
