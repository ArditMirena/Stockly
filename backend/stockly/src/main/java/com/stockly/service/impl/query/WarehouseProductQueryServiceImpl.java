package com.stockly.service.impl.query;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.mapper.WarehouseProductMapper;
import com.stockly.model.Company;
import com.stockly.model.PredictionResult;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.PredictionResultRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.service.query.PredictionQueryService;
import com.stockly.service.query.WarehouseProductQueryService;
import com.stockly.specification.CompanySpecification;
import com.stockly.specification.WarehouseProductSpecification;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseProductQueryServiceImpl implements WarehouseProductQueryService {
    private final WarehouseProductRepository warehouseProductRepository;
    private final WarehouseProductMapper warehouseProductMapper;
    private final PredictionQueryService predictionQueryService;

    @Override
    public Page<WarehouseProductDTO> getAllWarehouseProductsWithPagination(PageRequest pageRequest, Long warehouseId, String searchTerm) {
        Specification<WarehouseProduct> spec = Specification.where(null);
        if (StringUtils.isNotEmpty(searchTerm)) {
            spec = spec.and(WarehouseProductSpecification.unifiedSearch(searchTerm));
        }

        if (warehouseId != null) {
            spec = spec.and(WarehouseProductSpecification.byWarehouseId(warehouseId));
        }


        spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("warehouse").get("isActive"), true));


        Page<WarehouseProduct> warehouseProducts = warehouseProductRepository.findAll(spec, pageRequest);

        return warehouseProducts.map(warehouseProductMapper::toDTO);
    }


    @Override
    public void orderAutomationWarehouseProducts(String month){
        List<WarehouseProduct> productsToAutomate = warehouseProductRepository.findAll();

        for (WarehouseProduct wp : productsToAutomate) {
            if (!wp.isAutomatedRestock()) {
                continue;
            }

            Long productId = wp.getProduct().getId();

            PredictionResult prediction = predictionQueryService.getPredictionsByProductId(month, productId);

            if (prediction == null || prediction.getRecommendation() == null) {
                continue; // Skip if no prediction
            }

            int suggestedRestock = prediction.getRecommendationRestock();
            int currentStock = wp.getQuantity();

            if(currentStock < suggestedRestock){
                wp.setQuantity(suggestedRestock);
                warehouseProductRepository.save(wp);
            }
        }
    }
}
