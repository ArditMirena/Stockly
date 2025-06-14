package com.stockly.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import com.stockly.dto.CompanySummaryDTO;
import com.stockly.dto.ReceiptDTO;
import com.stockly.dto.ReceiptItemDTO;
import com.stockly.service.ReceiptPdfService;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.stream.Stream;

@Service
public class ReceiptPdfServiceImpl implements ReceiptPdfService {

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font NORMAL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font TOTAL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
    private static final Color TABLE_HEADER_COLOR = new Color(230, 230, 250);

    @Override
    public ByteArrayInputStream generateReceiptPdf(ReceiptDTO receipt) throws IOException {
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Header
            addTitleSection(document);
            addOrderInfoSection(document, receipt);
            addCompanySection(document, receipt);
            addWarehouseSection(document, receipt);
            addItemsSection(document, receipt);
            addTotalSection(document, receipt);
            addSignatureSection(document);
            addFooter(document);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTitleSection(Document document) throws DocumentException {
        Paragraph title = new Paragraph("ORDER RECEIPT", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(15f);
        document.add(title);
    }

    private void addOrderInfoSection(Document document, ReceiptDTO receipt) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10f);

        addOrderInfoCell(table, "Order ID", receipt.getOrderId().toString());
        addOrderInfoCell(table, "Order Date", formatDate(Date.from(receipt.getOrderDate())));
        addOrderInfoCell(table, "Delivery Date", formatDate(receipt.getDeliveryDate()));
        addOrderInfoCell(table, "Status", receipt.getStatus());

        document.add(table);
    }

    private void addCompanySection(Document document, ReceiptDTO receipt) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(10f);

        PdfPCell buyerCell = buildCompanyCell("Buyer", receipt.getBuyer());
        PdfPCell supplierCell = buildCompanyCell("Supplier", receipt.getSupplier());

        table.addCell(buyerCell);
        table.addCell(supplierCell);

        document.add(table);
    }

    private void addWarehouseSection(Document document, ReceiptDTO receipt) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(15f);

        PdfPCell source = new PdfPCell();
        source.setBorder(Rectangle.NO_BORDER);
        source.addElement(new Paragraph("Source Warehouse", HEADER_FONT));
        source.addElement(new Paragraph(receipt.getSourceWarehouse().getName(), NORMAL_FONT));
        source.addElement(new Paragraph(receipt.getSourceWarehouse().getAddress(), NORMAL_FONT));

        PdfPCell destination = new PdfPCell();
        destination.setBorder(Rectangle.NO_BORDER);
        destination.addElement(new Paragraph("Destination Warehouse", HEADER_FONT));

        if (receipt.getDestinationWarehouse() != null) {
            destination.addElement(new Paragraph(receipt.getDestinationWarehouse().getName(), NORMAL_FONT));
            destination.addElement(new Paragraph(receipt.getDestinationWarehouse().getAddress(), NORMAL_FONT));
        } else {
            destination.addElement(new Paragraph("Not specified", NORMAL_FONT));
            destination.addElement(new Paragraph("-", NORMAL_FONT));
        }

        table.addCell(destination);
        table.addCell(source);

        document.add(table);
    }

    private void addItemsSection(Document document, ReceiptDTO receipt) throws DocumentException {
        PdfPTable table = new PdfPTable(5);
        table.setWidths(new float[]{3, 1.5f, 1.5f, 1f, 1.5f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(10f);

        Stream.of("Product", "SKU", "Unit Price", "Qty", "Line Total")
                .forEach(header -> {
                    PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
                    cell.setBackgroundColor(TABLE_HEADER_COLOR);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cell.setPadding(6f);
                    table.addCell(cell);
                });

        for (ReceiptItemDTO item : receipt.getItems()) {
            addItemCell(table, item.getProductTitle(), Element.ALIGN_LEFT);
            addItemCell(table, item.getProductSku(), Element.ALIGN_CENTER);
            addItemCell(table, "$" + formatPrice(item.getUnitPrice()), Element.ALIGN_RIGHT);
            addItemCell(table, String.valueOf(item.getQuantity()), Element.ALIGN_CENTER);
            addItemCell(table, "$" + formatPrice(item.getTotalPrice()), Element.ALIGN_RIGHT);
        }

        document.add(table);
    }

    private void addTotalSection(Document document, ReceiptDTO receipt) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidths(new float[]{2, 1});
        table.setWidthPercentage(40);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingAfter(20f);

        PdfPCell label = new PdfPCell(new Phrase("Total Amount", TOTAL_FONT));
        label.setBorder(Rectangle.TOP);
        label.setPadding(5f);

        PdfPCell value = new PdfPCell(new Phrase("$" + formatPrice(receipt.getTotalPrice()), TOTAL_FONT));
        value.setBorder(Rectangle.TOP);
        value.setHorizontalAlignment(Element.ALIGN_RIGHT);
        value.setPadding(5f);

        table.addCell(label);
        table.addCell(value);

        document.add(table);
    }

    private void addSignatureSection(Document document) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidths(new int[]{1, 1});
        table.setWidthPercentage(100);
        table.setSpacingBefore(40f);

        PdfPCell buyerSig = new PdfPCell();
        buyerSig.setBorder(Rectangle.NO_BORDER);
        buyerSig.setPaddingTop(30f);
        buyerSig.addElement(new Paragraph("__________________________", NORMAL_FONT));
        buyerSig.addElement(new Paragraph("Buyer Signature", HEADER_FONT));

        PdfPCell supplierSig = new PdfPCell();
        supplierSig.setBorder(Rectangle.NO_BORDER);
        supplierSig.setPaddingTop(30f);
        supplierSig.addElement(new Paragraph("__________________________", NORMAL_FONT));
        supplierSig.addElement(new Paragraph("Supplier Signature", HEADER_FONT));

        table.addCell(buyerSig);
        table.addCell(supplierSig);

        document.add(table);
    }

    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph("This receipt was generated by Stockly Software. Thank you for using our service.", NORMAL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30f);
        footer.setFont(new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
        document.add(footer);
    }

    private void addOrderInfoCell(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", HEADER_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(4f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, NORMAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(4f);
        table.addCell(valueCell);
    }

    private PdfPCell buildCompanyCell(String title, CompanySummaryDTO company) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setPadding(10f);
        cell.addElement(new Paragraph(title.toUpperCase(), SUBTITLE_FONT));
        cell.addElement(new Paragraph(company.getCompanyName(), NORMAL_FONT));
        cell.addElement(new Paragraph(company.getAddress().toString(), NORMAL_FONT));
        cell.addElement(new Paragraph(company.getEmail(), NORMAL_FONT));
        cell.addElement(new Paragraph(company.getPhoneNumber(), NORMAL_FONT));
        return cell;
    }

    private void addItemCell(PdfPTable table, String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private String formatDate(Date date) {
        if (date == null) return "N/A";
        return new SimpleDateFormat("yyyy-MM-dd HH:mm").format(date);
    }

    private String formatPrice(Number price) {
        return String.format("%.2f", price.doubleValue());
    }
}
