package com.stockly.specification;

import com.stockly.model.User;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;


public class UserSpecification {
    public static Specification<User> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate usernamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("username")),
                    likePattern
            );

            Predicate emailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("email")),
                    likePattern
            );

            Predicate rolePredicate = criteriaBuilder.like(
                    criteriaBuilder.upper(root.join("role").get("name").as(String.class)),
                    likePattern(searchTerm.toUpperCase())
            );

            return criteriaBuilder.or(usernamePredicate, emailPredicate, rolePredicate);
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}
