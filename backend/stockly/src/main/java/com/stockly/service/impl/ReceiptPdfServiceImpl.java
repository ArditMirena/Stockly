package com.stockly.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.stockly.dto.ReceiptDTO;
import com.stockly.dto.ReceiptItemDTO;
import com.stockly.service.ReceiptPdfService;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ReceiptPdfServiceImpl implements ReceiptPdfService {

    @Override
    public ByteArrayInputStream generateReceiptPdf(ReceiptDTO receipt) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" ")); // Spacer

            // Order Info
            document.add(new Paragraph("Order ID: " + receipt.getOrderId(), normalFont));
            document.add(new Paragraph("Order Date: " + receipt.getOrderDate(), normalFont));
            document.add(new Paragraph("Delivery Date: " + receipt.getDeliveryDate(), normalFont));
            document.add(new Paragraph("Status: " + receipt.getStatus(), normalFont));
            document.add(new Paragraph("Total Price: $" + receipt.getTotalPrice(), normalFont));
            document.add(new Paragraph(" "));

            // Buyer Info
            document.add(new Paragraph("Buyer Info:", headerFont));
            document.add(new Paragraph("Company: " + receipt.getBuyer().getCompanyName(), normalFont));
            document.add(new Paragraph("Email: " + receipt.getBuyer().getEmail(), normalFont));
            document.add(new Paragraph("Phone: " + receipt.getBuyer().getPhoneNumber(), normalFont));
            document.add(new Paragraph("Address: " + receipt.getBuyer().getAddress(), normalFont));
            document.add(new Paragraph(" "));

            // Supplier Info
            document.add(new Paragraph("Supplier Info:", headerFont));
            document.add(new Paragraph("Company: " + receipt.getSupplier().getCompanyName(), normalFont));
            document.add(new Paragraph("Email: " + receipt.getSupplier().getEmail(), normalFont));
            document.add(new Paragraph("Phone: " + receipt.getSupplier().getPhoneNumber(), normalFont));
            document.add(new Paragraph("Address: " + receipt.getSupplier().getAddress(), normalFont));
            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 2, 2, 2, 2});

            Stream.of("Product", "SKU", "Unit Price", "Quantity", "Total Price")
                    .forEach(header -> {
                        PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        cell.setBackgroundColor(Color.LIGHT_GRAY);
                        table.addCell(cell);
                    });

            List<ReceiptItemDTO> items = receipt.getItems();
            for (ReceiptItemDTO item : items) {
                table.addCell(new Phrase(item.getProductTitle(), normalFont));
                table.addCell(new Phrase(item.getProductSku(), normalFont));
                table.addCell(new Phrase("$" + item.getUnitPrice(), normalFont));
                table.addCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                table.addCell(new Phrase("$" + item.getTotalPrice(), normalFont));
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
