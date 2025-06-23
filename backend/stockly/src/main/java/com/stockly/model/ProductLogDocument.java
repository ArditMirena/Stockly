package com.stockly.model;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "product_logs")
@Getter
@Setter
public class ProductLogDocument {
    @Id
    private String id;
    private Long productId;
    private String action; // CREATE, UPDATE, DELETE
    private Instant timestamp;
    private Object data; // Stores ProductDTO
}