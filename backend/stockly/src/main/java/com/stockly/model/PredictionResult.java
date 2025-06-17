package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Getter
@Setter
public class PredictionResult {
    @Id
    private String id;

    @Field("warehouse_id")
    @JsonProperty("warehouse_id")
    private Long warehouseId;

    private Metadata metadata;

    @Field("product_id")
    @JsonProperty("product_id")
    private Long productId;

    @Field("data_hash")
    @JsonProperty("data_hash")
    private String dataHash;

    @Field("stock_data")
    @JsonProperty("stock_data")
    private StockData stockData;

    @Field("demand_forecast")
    @JsonProperty("demand_forecast")
    private DemandForecast demandForecast;

    private Recommendation recommendation;

    public double getDaysRemaining() {return stockData.getDaysRemaining();}
    public double getWeeklyPredicted7d() {return demandForecast.getWeeklyPredicted7d();}
    public Integer getRecommendationRestock() {
        return recommendation.getSuggestedRestock();
    }
}

@Getter
@Setter
class Metadata {
    @Field("created_at")
    @JsonProperty("created_at")
    private Instant createdAt;

    private String version;
    private String source;

    @Field("prediction_run_id")
    @JsonProperty("prediction_run_id")
    private String predictionRunId;

}

@Getter
@Setter
class StockData {
    private int current;

    @Field("days_remaining")
    @JsonProperty("days_remaining")
    private double daysRemaining;
}

@Getter
@Setter
class DemandForecast {
    @Field("daily_avg")
    @JsonProperty("daily_avg")
    private double dailyAvg;

    @Field("daily_predicted")
    @JsonProperty("daily_predicted")
    private double dailyPredicted;

    @Field("weekly_predicted_7d")
    @JsonProperty("weekly_predicted_7d")
    private double weeklyPredicted7d;
}

@Getter
@Setter
class Recommendation {
    @Field("safety_stock")
    @JsonProperty("safety_stock")
    private int safetyStock;

    @Field("suggested_restock")
    @JsonProperty("suggested_restock")
    private int suggestedRestock;
}
