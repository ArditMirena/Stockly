package com.stockly.specification;

import com.stockly.model.Receipt;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class ReceiptSpecification {
    public static Specification<Receipt> byBuyerCompanyId(Long buyerCompanyId) {
        return (root, query, cb) ->
                buyerCompanyId == null ? null : cb.equal(root.get("buyer").get("id"), buyerCompanyId);
    }

    public static Specification<Receipt> bySupplierCompanyId(Long supplierCompanyId) {
        return (root, query, cb) ->
                supplierCompanyId == null ? null : cb.equal(root.get("supplier").get("id"), supplierCompanyId);
    }

    public static Specification<Receipt> byCompanyId(Long companyId) {
        return (root, query, cb) ->
                companyId == null ? null :
                        cb.or(
                                cb.equal(root.get("buyer").get("id"), companyId),
                                cb.equal(root.get("supplier").get("id"), companyId)
                        );
    }

    public static Specification<Receipt> bySourceWarehouseId(Long sourceWarehouseId) {
        return (root, query, cb) ->
                sourceWarehouseId == null ? null : cb.equal(root.get("sourceWarehouse").get("id"), sourceWarehouseId);
    }

    public static Specification<Receipt> byDestinationWarehouseId(Long destinationWarehouseId) {
        return (root, query, cb) ->
                destinationWarehouseId == null ? null : cb.equal(root.get("destinationWarehouse").get("id"), destinationWarehouseId);
    }

    public static Specification<Receipt> byWarehouseId(Long warehouseId) {
        return (root, query, cb) ->
                warehouseId == null ? null :
                        cb.or(
                                cb.equal(root.get("sourceWarehouse").get("id"), warehouseId),
                                cb.equal(root.get("destinationWarehouse").get("id"), warehouseId)
                        );
    }

    public static Specification<Receipt> byManagerId(Long managerId) {
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

    public static Specification<Receipt> byBuyerManagerId(Long buyerManagerId) {
        return (root, query, cb) -> {
            if (buyerManagerId == null) return null;
            var buyerJoin = root.join("buyer", JoinType.LEFT);
            return cb.equal(buyerJoin.get("manager").get("id"), buyerManagerId);
        };
    }

    public static Specification<Receipt> bySupplierManagerId(Long supplierManagerId) {
        return (root, query, cb) -> {
            if (supplierManagerId == null) return null;
            var supplierJoin = root.join("supplier", JoinType.LEFT);
            return cb.equal(supplierJoin.get("manager").get("id"), supplierManagerId);
        };
    }

    public static Specification<Receipt> unifiedSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (StringUtils.isBlank(searchTerm)) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = likePattern(searchTerm.toLowerCase());

            // Create joins
            Join<Receipt, Object> buyerJoin = root.join("buyer", JoinType.LEFT);
            Join<Receipt, Object> supplierJoin = root.join("supplier", JoinType.LEFT);
            Join<Receipt, Object> destinationWarehouseJoin = root.join("destinationWarehouse", JoinType.LEFT);
            Join<Receipt, Object> sourceWarehouseJoin = root.join("sourceWarehouse", JoinType.LEFT);

            // Join address hierarchy for destination warehouse
            Join<Object, Object> destAddressJoin = destinationWarehouseJoin.join("address", JoinType.LEFT);
            Join<Object, Object> destCityJoin = destAddressJoin.join("city", JoinType.LEFT);
            Join<Object, Object> destCountryJoin = destCityJoin.join("country", JoinType.LEFT);

            // Join address hierarchy for source warehouse
            Join<Object, Object> sourceAddressJoin = sourceWarehouseJoin.join("address", JoinType.LEFT);
            Join<Object, Object> sourceCityJoin = sourceAddressJoin.join("city", JoinType.LEFT);
            Join<Object, Object> sourceCountryJoin = sourceCityJoin.join("country", JoinType.LEFT);

            // Create predicates for all searchable fields
            Predicate buyerNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(buyerJoin.get("companyName")), likePattern
            );

            Predicate supplierNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(supplierJoin.get("companyName")), likePattern
            );

            Predicate destinationWarehouseNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(destinationWarehouseJoin.get("name")), likePattern
            );

            Predicate sourceWarehouseNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(sourceWarehouseJoin.get("name")), likePattern
            );

            Predicate buyerEmailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(buyerJoin.get("email")), likePattern
            );

            Predicate supplierEmailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(supplierJoin.get("email")), likePattern
            );

            // Address component predicates
            Predicate destAddressPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(destAddressJoin.get("street")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(destAddressJoin.get("postalCode")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(destCityJoin.get("name")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(destCountryJoin.get("name")), likePattern)
            );

            Predicate sourceAddressPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(sourceAddressJoin.get("street")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(sourceAddressJoin.get("postalCode")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(sourceCityJoin.get("name")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(sourceCountryJoin.get("name")), likePattern)
            );

            return criteriaBuilder.or(
                    buyerNamePredicate,
                    supplierNamePredicate,
                    destinationWarehouseNamePredicate,
                    sourceWarehouseNamePredicate,
                    buyerEmailPredicate,
                    supplierEmailPredicate,
                    destAddressPredicate,
                    sourceAddressPredicate
            );
        };
    }

    private static String likePattern(String value) {
        return "%" + value + "%";
    }
}