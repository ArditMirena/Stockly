package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
public class DemandForecast {
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
