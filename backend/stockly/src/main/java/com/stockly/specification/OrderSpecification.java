package com.stockly.specification;

import com.stockly.model.Company;
import com.stockly.model.Order;
import com.stockly.model.enums.OrderStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpecification {

    public static Specification<Order> byStatus(OrderStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Order> byBuyer(Long buyerId) {
        return (root, query, criteriaBuilder) -> {
            if (buyerId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Order, Company> buyerJoin = root.join("buyer");
            return criteriaBuilder.equal(buyerJoin.get("id"), buyerId);
        };
    }

    public static Specification<Order> byManagerId(Long managerId) {
        return (root, query, cb) -> {
            if (managerId == null) return null;
            var buyerJoin = root.join("buyer", JoinType.LEFT);
            var supplierJoin = root.join("supplier", JoinType.LEFT);
            return cb.or(
                    cb.equal(buyerJoin.get("manager").get("id"), managerId),
                    cb.equal(supplierJoin.get("manager").get("id"), managerId)
            );
        };
    }

    public static Specification<Order> bySupplier(Long supplierId) {
        return (root, query, criteriaBuilder) -> {
            if (supplierId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Order, Company> supplierJoin = root.join("supplier");
            return criteriaBuilder.equal(supplierJoin.get("id"), supplierId);
        };
    }

    public static Specification<Order> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            // Search in order fields
            Predicate statusPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("status").as(String.class)),
                    likePattern
            );

            Predicate shipmentIdPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("shipmentId")),
                    likePattern
            );

            // Search in buyer company fields
            Join<Order, Company> buyerJoin = root.join("buyer", JoinType.LEFT);
            Predicate buyerNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(buyerJoin.get("companyName")),
                    likePattern
            );

            Predicate buyerEmailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(buyerJoin.get("email")),
                    likePattern
            );

            // Search in supplier company fields
            Join<Order, Company> supplierJoin = root.join("supplier", JoinType.LEFT);
            Predicate supplierNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(supplierJoin.get("companyName")),
                    likePattern
            );

            Predicate supplierEmailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(supplierJoin.get("email")),
                    likePattern
            );

            return criteriaBuilder.or(
                    statusPredicate,
                    shipmentIdPredicate,
                    buyerNamePredicate,
                    buyerEmailPredicate,
                    supplierNamePredicate,
                    supplierEmailPredicate
            );
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }

    // Combine multiple specifications
    public static Specification<Order> combine(
            OrderStatus status,
            Long buyerId,
            Long supplierId,
            String searchTerm
    ) {
        return Specification.where(byStatus(status))
                .and(byBuyer(buyerId))
                .and(bySupplier(supplierId))
                .and(unifiedSearch(searchTerm));
    }
}