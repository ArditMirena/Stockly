package com.stockly.controller.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.dto.OrderDTO;
import com.stockly.dto.ReceiptDTO;
import com.stockly.mapper.ReceiptMapper;
import com.stockly.service.ReceiptPdfService;
import com.stockly.service.command.EmailService;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.service.query.OrderQueryService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final OrderQueryService orderQueryService;
    private final CompanyQueryService companyQueryService;
    private final ReceiptPdfService receiptPdfService;
    private final EmailService emailService;

    @PostMapping("/{orderId}/email")
    public String sendReceipt(@PathVariable Long orderId) {
        try {
            OrderDTO order = orderQueryService.getOrderById(orderId);
            CompanyDTO buyer = companyQueryService.getCompanyById(order.getBuyerId());
            CompanyDTO supplier = companyQueryService.getCompanyById(order.getSupplierId());

            ReceiptDTO receiptDTO = ReceiptMapper.toReceiptDTO(order, buyer, supplier);
            ByteArrayInputStream pdfStream = receiptPdfService.generateReceiptPdf(receiptDTO);

            // Prepare attachment
            InputStreamSource attachment = new ByteArrayResource(pdfStream.readAllBytes());

            // Reuse your EmailService
            String subject = "Your Receipt for Order #" + order.getId();
            String text = "Hello " + buyer.getCompanyName() + ",<br><br>Attached is your receipt.";
            emailService.sendEmailWithAttachment(buyer.getEmail(), subject, text, attachment,
                    "receipt-order-" + order.getId() + ".pdf", MediaType.APPLICATION_PDF_VALUE);

            return "Receipt sent successfully.";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Failed to send receipt: " + e.getMessage();
        }
    }
}
