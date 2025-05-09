package com.stockly.controller.query;

import com.stockly.model.PredictionResult;
import com.stockly.service.query.PredictionQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/predictions")
public class PredictionQueryController {

    private final PredictionQueryService predictionQueryService;

    public PredictionQueryController(PredictionQueryService predictionQueryService) {
        this.predictionQueryService = predictionQueryService;
    }

    @GetMapping("/{month}")
    public List<PredictionResult> getPredictions(@PathVariable String month) {
        return predictionQueryService.getPredictions(month);
    }

    @GetMapping("/{month}/warehouse/{warehouseId}")
    public List<PredictionResult> getPredictionsByWarehouse(
            @PathVariable String month,
            @PathVariable long warehouseId) {
        return predictionQueryService.getPredictionsByWarehouseId(month, warehouseId);
    }

    @GetMapping("/{month}/product/{productId}")
    public List<PredictionResult> getPredictionsByProduct(
            @PathVariable String month,
            @PathVariable long productId) {
        return predictionQueryService.getPredictionsByProductId(month, productId);
    }

    @GetMapping("/current")
    public List<PredictionResult> getCurrentMonthPredictions() {
        return predictionQueryService.getCurrentMonthPredictions();
    }

    @GetMapping("/current/warehouse/{warehouseId}")
    public List<PredictionResult> getCurrentMonthPredictionsByWarehouse(
            @PathVariable long warehouseId) {
        String currentMonth = predictionQueryService.getCurrentMonth();
        return predictionQueryService.getPredictionsByWarehouseId(currentMonth, warehouseId);
    }

    @GetMapping("/current/product/{productId}")
    public List<PredictionResult> getCurrentMonthPredictionsByProduct(
            @PathVariable long productId) {
        String currentMonth = predictionQueryService.getCurrentMonth();
        return predictionQueryService.getPredictionsByProductId(currentMonth, productId);
    }
}