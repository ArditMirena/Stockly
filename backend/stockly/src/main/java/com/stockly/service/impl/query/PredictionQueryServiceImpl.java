package com.stockly.service.impl.query;

import com.stockly.model.PredictionResult;
import com.stockly.service.query.PredictionQueryService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PredictionQueryServiceImpl implements PredictionQueryService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");
    private static final String COLLECTION_PREFIX = "predictions_";

    private final MongoTemplate mongoTemplate;

    public PredictionQueryServiceImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<PredictionResult> getPredictions(String month) {
        validateMonthFormat(month);
        String collectionName = COLLECTION_PREFIX + month;
        return mongoTemplate.findAll(PredictionResult.class, collectionName);
    }

    @Override
    public List<PredictionResult> getPredictionsByWarehouseId(String month, long warehouseId) {
        validateMonthFormat(month);
        String collectionName = COLLECTION_PREFIX + month;

        Query query = new Query(Criteria.where("warehouse_id").is(warehouseId));
        return mongoTemplate.find(query, PredictionResult.class, collectionName);
    }

    @Override
    public PredictionResult getPredictionsByProductId(String month, Long productId) {
        validateMonthFormat(month);
        String collectionName = COLLECTION_PREFIX + month;

        Query query = new Query(Criteria.where("product_id").is(productId));
        return mongoTemplate.findOne(query, PredictionResult.class, collectionName);
    }

    @Override
    public List<PredictionResult> getCurrentMonthPredictions() {
        String currentMonth = YearMonth.now().format(MONTH_FORMATTER);
        return getPredictions(currentMonth);
    }

    private void validateMonthFormat(String month) {
        try {
            YearMonth.parse(month, MONTH_FORMATTER);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid month format. Expected format: yyyyMM");
        }
    }

    @Override
    public String getCurrentMonth() {
        return YearMonth.now().format(MONTH_FORMATTER);
    }
}