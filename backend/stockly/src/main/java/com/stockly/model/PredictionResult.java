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

    public Integer getRecommendationRestock() {
        return recommendation.getSuggestedRestock();
    }
}

