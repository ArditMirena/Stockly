package com.stockly.repository;

import com.stockly.model.Dimension;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DimensionRepository extends JpaRepository<Dimension, Long> {
}
