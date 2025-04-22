package com.stockly.specification;

import com.stockly.model.Company;
import com.stockly.model.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class CompanySpecification {
    public static Specification<Company> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if(StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate companyNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("companyName")),  likePattern
            );

            Predicate emailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("email")),  likePattern
            );

            Predicate phonePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("phoneNumber")), likePattern
            );

            Predicate companyTypePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("companyType")), likePattern
            );

            Predicate businessTypePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("businessType")), likePattern
            );

            Join<Company, User> managerJoin = root.join("manager", JoinType.LEFT);

            Predicate managerUsernamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(managerJoin.get("username")), likePattern
            );

            Predicate managerEmailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(managerJoin.get("email")), likePattern
            );

            return criteriaBuilder.or(
                    companyNamePredicate,
                    emailPredicate,
                    phonePredicate,
                    companyTypePredicate,
                    businessTypePredicate,
                    managerUsernamePredicate,
                    managerEmailPredicate);
        };
    }
    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}
