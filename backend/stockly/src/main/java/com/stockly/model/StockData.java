package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
public class StockData {
    private int current;

    @Field("days_remaining")
    @JsonProperty("days_remaining")
    private double daysRemaining;
}
