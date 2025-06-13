package com.stockly.service.query;

import com.stockly.model.PredictionResult;

import java.util.List;

public interface PredictionQueryService {
    List<PredictionResult> getPredictions(String month);
    List<PredictionResult> getPredictionsByWarehouseId(String month, long warehouseId);
    PredictionResult getPredictionsByProductId(String month, Long productId);
    List<PredictionResult> getCurrentMonthPredictions();
    String getCurrentMonth();
}
