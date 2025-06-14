package com.stockly.service.impl;

import com.stockly.dto.WarehouseProductExcelDTO;
import com.stockly.service.ExcelParserService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelParserServiceImpl implements ExcelParserService {
    public List<WarehouseProductExcelDTO> parseWarehouseProductExcel(MultipartFile file) throws IOException {
        List<WarehouseProductExcelDTO> result = new ArrayList<>();

        try (InputStream is = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;

                WarehouseProductExcelDTO dto = new WarehouseProductExcelDTO();
                dto.setWarehouseId(getLongCellValue(row.getCell(0)));
                dto.setWarehouseName(getStringCellValue(row.getCell(1)));
                dto.setProductTitle(getStringCellValue(row.getCell(2)));
                dto.setProductSku(getStringCellValue(row.getCell(3)));
                dto.setProductPrice(BigDecimal.valueOf(getDoubleCellValue(row.getCell(4))));
                dto.setQuantity(getDoubleCellValue(row.getCell(5)).intValue());

                result.add(dto);
            }
        }

        return result;
    }

    private String getStringCellValue(Cell cell) {
        return cell == null ? null : cell.getStringCellValue().trim();
    }

    private Double getDoubleCellValue(Cell cell) {
        return cell == null ? null : cell.getNumericCellValue();
    }

    private Long getLongCellValue(Cell cell) {
        Double val = getDoubleCellValue(cell);
        return val == null ? null : val.longValue();
    }
}
