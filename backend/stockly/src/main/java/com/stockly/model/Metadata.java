package com.stockly.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Getter
@Setter
public class Metadata {
    @Field("created_at")
    @JsonProperty("created_at")
    private Instant createdAt;

    private String version;
    private String source;

    @Field("prediction_run_id")
    @JsonProperty("prediction_run_id")
    private String predictionRunId;

}
