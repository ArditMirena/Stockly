package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
public class Recommendation {
    @Field("safety_stock")
    @JsonProperty("safety_stock")
    private int safetyStock;

    @Field("suggested_restock")
    @JsonProperty("suggested_restock")
    private int suggestedRestock;
}
