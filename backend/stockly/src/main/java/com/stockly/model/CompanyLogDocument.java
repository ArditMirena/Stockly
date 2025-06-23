// CompanyLogDocument.java
package com.stockly.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "company_logs")
@Getter
@Setter
public class CompanyLogDocument {
    @Id
    private String id;
    private Long companyId;
    private String action; // CREATE, UPDATE, DELETE
    private Instant timestamp;
    private Object data; // Generic to store any DTO
}