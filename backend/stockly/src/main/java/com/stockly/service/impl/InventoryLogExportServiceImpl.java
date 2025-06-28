package com.stockly.service.impl;

import com.stockly.model.InventoryLog;
import com.stockly.service.InventoryLogExportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;

@Service
public class InventoryLogExportServiceImpl implements InventoryLogExportService {

    @Override
    public ByteArrayInputStream exportToExcel(List<InventoryLog> logs) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Inventory Logs");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Warehouse", "SKU", "Product", "Action", "Qty Change",
                    "Previous Qty", "New Qty", "Source", "Reference Type",
                    "Reference ID", "User", "Notes", "Timestamp"
            };

            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Handle empty data case
            if (logs == null || logs.isEmpty()) {
                Row row = sheet.createRow(1);
                Cell cell = row.createCell(0);
                cell.setCellValue("No inventory logs found matching the criteria");

                // Merge cells for the message
                sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, headers.length - 1));

                // Center align the message
                CellStyle messageStyle = workbook.createCellStyle();
                messageStyle.setAlignment(HorizontalAlignment.CENTER);
                cell.setCellStyle(messageStyle);
            } else {
                // Create data rows
                int rowNum = 1;
                for (InventoryLog log : logs) {
                    Row row = sheet.createRow(rowNum++);

                    row.createCell(0).setCellValue(log.getWarehouseName() != null ? log.getWarehouseName() : "");
                    row.createCell(1).setCellValue(log.getProductSku() != null ? log.getProductSku() : "");
                    row.createCell(2).setCellValue(log.getProductTitle() != null ? log.getProductTitle() : "");
                    row.createCell(3).setCellValue(log.getActionType() != null ? log.getActionType() : "");
                    row.createCell(4).setCellValue(log.getQuantityChange() != null ? log.getQuantityChange() : 0);
                    row.createCell(5).setCellValue(log.getPreviousQuantity() != null ? log.getPreviousQuantity() : 0);
                    row.createCell(6).setCellValue(log.getNewQuantity() != null ? log.getNewQuantity() : 0);
                    row.createCell(7).setCellValue(log.getSource() != null ? log.getSource() : "");
                    row.createCell(8).setCellValue(log.getReferenceType() != null ? log.getReferenceType() : "");
                    row.createCell(9).setCellValue(log.getReferenceId() != null ? log.getReferenceId() : "");
                    row.createCell(10).setCellValue(log.getUserName() != null ? log.getUserName() : "");
                    row.createCell(11).setCellValue(log.getNotes() != null ? log.getNotes() : "");

                    if (log.getTimestamp() != null) {
                        Cell dateCell = row.createCell(12);
                        dateCell.setCellValue(log.getTimestamp().atZone(ZoneId.systemDefault()).toLocalDateTime());

                        // Format date cells
                        CellStyle dateCellStyle = workbook.createCellStyle();
                        CreationHelper createHelper = workbook.getCreationHelper();
                        dateCellStyle.setDataFormat(
                                createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
                        dateCell.setCellStyle(dateCellStyle);
                    } else {
                        row.createCell(12).setCellValue("");
                    }
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export inventory logs to Excel", e);
        }
    }

    @Override
    public ByteArrayInputStream exportToExcel(Page<InventoryLog> logPage) {
        return exportToExcel(logPage != null ? logPage.getContent() : Collections.emptyList());
    }
}