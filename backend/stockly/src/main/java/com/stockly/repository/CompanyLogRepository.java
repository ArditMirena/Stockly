package com.stockly.repository;

import com.stockly.model.CompanyLogDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CompanyLogRepository extends MongoRepository<CompanyLogDocument, String> {


    List<CompanyLogDocument> findByCompanyId(Long companyId);
    Page<CompanyLogDocument> findByCompanyId(Long companyId, Pageable pageable);
    Page<CompanyLogDocument> findByAction(String action, Pageable pageable);
}
