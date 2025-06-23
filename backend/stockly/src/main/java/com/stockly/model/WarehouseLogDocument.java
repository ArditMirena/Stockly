

// WarehouseLogDocument.java
package com.stockly.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "warehouse_logs")
@Getter
@Setter
public class WarehouseLogDocument {
    @Id
    private String id;
    private Long warehouseId;
    private String action; // CREATE, UPDATE, DELETE
    private Instant timestamp;
    private Object data; // Stores WarehouseDTO
}
