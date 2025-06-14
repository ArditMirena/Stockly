package com.stockly.service;

import com.stockly.dto.WarehouseProductExcelDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ExcelParserService {
    List<WarehouseProductExcelDTO> parseWarehouseProductExcel(MultipartFile file) throws IOException;
}
