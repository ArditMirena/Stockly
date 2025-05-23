package com.stockly.specification;

import com.stockly.model.City;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class CitySpecification {
    public static Specification<City> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if(StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate cityNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), likePattern
            );

            return criteriaBuilder.or(cityNamePredicate);
        };
    }
    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}
