package com.stockly.response;

import com.stockly.dto.ExternalProductDTO;
import lombok.Data;

import java.util.List;

@Data
public class ExternalProductResponse {
    private List<ExternalProductDTO> products;
    private int total;
    private int skip;
    private int limit;
}
