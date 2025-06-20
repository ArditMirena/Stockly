package com.stockly.config;

import com.stockly.model.InventoryLog;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.MongoTemplate;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

@Configuration
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    public MongoIndexConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps(InventoryLog.class);

        // Compound index for warehouse and product queries
        indexOps.ensureIndex(new Index()
                .on("warehouseId", Sort.Direction.ASC)
                .on("productId", Sort.Direction.ASC)
                .on("timestamp", Sort.Direction.DESC)
                .named("warehouse_product_timestamp_idx"));

        // TTL index for automatic log expiration (e.g., 2 years)
        indexOps.ensureIndex(new Index()
                .on("timestamp", Sort.Direction.ASC)
                .expire(730, TimeUnit.DAYS) // 2 years
                .named("timestamp_ttl_idx"));

        // Index for reference lookups
        indexOps.ensureIndex(new Index()
                .on("referenceId", Sort.Direction.ASC)
                .on("referenceType", Sort.Direction.ASC)
                .named("reference_idx"));
    }
}