package com.stockly.service;

import com.stockly.model.InventoryLog;
import org.springframework.data.domain.Page;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface InventoryLogExportService {
    ByteArrayInputStream exportToExcel(List<InventoryLog> logs);
    ByteArrayInputStream exportToExcel(Page<InventoryLog> logPage);
}