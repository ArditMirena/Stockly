package com.stockly.repository;

import com.stockly.model.PredictionResult;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredictionResultRepository extends MongoRepository<PredictionResult, String> {
}

