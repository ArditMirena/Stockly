package com.stockly.specification;

import com.stockly.model.Address;
import com.stockly.model.Warehouse;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class WarehouseSpecification {
    public static Specification<Warehouse> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if(StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), likePattern
            );

            // Search in address fields
//            Join<Warehouse, Address> addressJoin = root.join("address", JoinType.LEFT);
//
//            Predicate addressStreetPredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(addressJoin.get("street")), likePattern
//            );
//
//            Predicate addressCityPredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(addressJoin.get("city")), likePattern
//            );
//
//            Predicate addressStatePredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(addressJoin.get("state")), likePattern
//            );
//
//            Predicate addressZipPredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(addressJoin.get("zipCode")), likePattern
//            );
//
//            Predicate addressCountryPredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(addressJoin.get("country")), likePattern
//            );

            return criteriaBuilder.or(
                    namePredicate
//                    addressStreetPredicate,
//                    addressCityPredicate,
//                    addressStatePredicate,
//                    addressZipPredicate,
//                    addressCountryPredicate
            );
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }

    public static Specification<Warehouse> byCompanyId(Long companyId) {
        return (root, query, criteriaBuilder) -> {
            if (companyId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("company").get("id"), companyId);
        };
    }
}