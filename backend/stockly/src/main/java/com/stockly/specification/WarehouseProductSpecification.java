package com.stockly.specification;

import com.stockly.model.WarehouseProduct;
import com.stockly.model.enums.AvailabilityStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class WarehouseProductSpecification {

    public static Specification<WarehouseProduct> byAvailability(AvailabilityStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("availability"), status.name());
        };
    }

    public static Specification<WarehouseProduct> byWarehouseId(Long warehouseId) {
        return (root, query, criteriaBuilder) -> {
            if (warehouseId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<WarehouseProduct, Object> warehouseJoin = root.join("warehouse");
            return criteriaBuilder.equal(warehouseJoin.get("id"), warehouseId);
        };
    }


    public static Specification<WarehouseProduct> byProductId(Long productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<WarehouseProduct, Object> productJoin = root.join("product");
            return criteriaBuilder.equal(productJoin.get("id"), productId);
        };
    }

    public static Specification<WarehouseProduct> byCompanyId(Long companyId) {
        return (root, query, cb) -> {
            if (companyId == null) return null;
            var warehouseJoin = root.join("warehouse", JoinType.LEFT);
            return cb.equal(warehouseJoin.get("company").get("id"), companyId);
        };
    }

    public static Specification<WarehouseProduct> byAutomatedRestock(Boolean automatedRestock) {
        return (root, query, criteriaBuilder) -> {
            if (automatedRestock == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("automatedRestock"), automatedRestock);
        };
    }

    public static Specification<WarehouseProduct> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = likePattern(searchTerm.toLowerCase());

            // Search in warehouse product fields
            Predicate availabilityPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("availability")),
                    likePattern
            );

            // Search in warehouse fields
            Join<WarehouseProduct, Object> warehouseJoin = root.join("warehouse", JoinType.LEFT);
            Predicate warehouseNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(warehouseJoin.get("name")),
                    likePattern
            );

            // Search in product fields
            Join<WarehouseProduct, Object> productJoin = root.join("product", JoinType.LEFT);
            Predicate productNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(productJoin.get("title")),
                    likePattern
            );

            Predicate productSkuPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(productJoin.get("sku")),
                    likePattern
            );

            return criteriaBuilder.or(
                    availabilityPredicate,
                    warehouseNamePredicate,
                    productNamePredicate,
                    productSkuPredicate
            );
        };
    }

    public static Specification<WarehouseProduct> quantityBetween(Integer minQuantity, Integer maxQuantity) {
        return (root, query, criteriaBuilder) -> {
            if (minQuantity == null && maxQuantity == null) {
                return criteriaBuilder.conjunction();
            }

            Predicate predicate = criteriaBuilder.conjunction();
            if (minQuantity != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("quantity"), minQuantity));
            }
            if (maxQuantity != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("quantity"), maxQuantity));
            }
            return predicate;
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }

    // Combine multiple specifications
    public static Specification<WarehouseProduct> combine(
            AvailabilityStatus availability,
            Long warehouseId,
            Long productId,
            Long companyId,
            Boolean automatedRestock,
            Integer minQuantity,
            Integer maxQuantity,
            String searchTerm
    ) {
        return Specification.where(byAvailability(availability))
                .and(byWarehouseId(warehouseId))
                .and(byProductId(productId))
                .and(byCompanyId(companyId))
                .and(byAutomatedRestock(automatedRestock))
                .and(quantityBetween(minQuantity, maxQuantity))
                .and(unifiedSearch(searchTerm));
    }
}